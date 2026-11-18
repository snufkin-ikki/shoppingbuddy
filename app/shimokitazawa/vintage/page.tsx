import type { Metadata } from "next";
import { filterProfiles, minimumRespectFee, walkStyles } from "../../directory-data";
import { entrySource, sampleShopSource, vintageDemoHref, vintageEntryPath, vintageFilters } from "../../shimokitazawa-entry";
import { buddySearchRequestHref } from "../../buddy-search-request";
import EntryTools from "./EntryTools";
import VintageSlots from "./VintageSlots";

const canonical = "https://shopping-buddy-mvp.ikkiyokoji.chatgpt.site" + vintageEntryPath;
const title = "下北沢で古着屋をめぐる | Shopping Buddy";
const description = "下北沢で古着屋を一緒にのぞく相方を探そう。Buddyごとの案内スタイル・所要時間・リスペクトフィーを見比べられます。";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical },
};

export default async function ShimokitazawaVintage({ searchParams }: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { from } = await searchParams;
  const source = entrySource(typeof from === "string" ? from : null);
  const candidates = filterProfiles(vintageFilters.query, vintageFilters.area, "", "registered", vintageFilters.category);

  return <main lang="ja" className="vintage-entry">
    <header className="vintage-header">
      <a href="/" aria-label="Shopping Buddy トップ"><img src="/shopping-buddy-logo-final.png" width={230} height={42} alt="Shopping Buddy" /></a>
      <a href="/#directory">全エリアのBuddyを探す</a>
    </header>
    <section className="vintage-intro">
      <div>
        <p className="eyebrow">下北沢 × 古着</p>
        <h1>下北沢で<br />古着屋をめぐる。</h1>
        <p>好きな服を一緒に探したり、気になる店をのぞいたり。古着に詳しいBuddyと、下北沢を歩いてみませんか。</p>
        <div className="vintage-intro-actions"><a className="vintage-primary" href="#vintage-slots">歩く時間を選ぶ</a><a href="#vintage-buddies">古着に詳しいBuddyを見る</a></div>
      </div>
      <img src="/urban-hero.png" width={900} height={620} alt="古着店やカフェが並ぶ街を歩く人々" />
    </section>

    <VintageSlots source={source} />
    <section className="vintage-candidates" id="vintage-buddies">
      <h2>下北沢を一緒に歩くBuddy</h2>
      <p>掲載されている案内スタイルとプランから、気になる人のプロフィールへ。</p>
      <div className="vintage-card-grid">
        {candidates.map(profile => <article key={profile.id} className="vintage-card">
          <img src={profile.image} width={480} height={330} alt={`${profile.name}のプロフィール写真`} loading="lazy" />
          <div>
            <h3>{profile.name}</h3>
            {profile.fee !== null && <p className="vintage-price">リスペクトフィー · 1時間 · {profile.fee.toLocaleString("ja-JP")}円{profile.fee === minimumRespectFee && "（税込）"}</p>}
            <p>{walkStyles[profile.id] ?? profile.description}</p>
            <a href={vintageDemoHref(source, profile.id)}>プロフィールを見る <span aria-hidden="true">→</span></a>
          </div>
        </article>)}
      </div>
      <div className="vintage-next">
        <a href={vintageDemoHref(source, "buddy-search-results")}>下北沢 × 古着で絞った一覧へ</a>
        <a href="#vintage-slots">歩く時間を選ぶ ↑</a>
        <a className="buddy-finder-link" href={buddySearchRequestHref(vintageFilters.area)}>こんなBuddyを探して！ <span aria-hidden="true">→</span></a>
      </div>
    </section>
    <EntryTools source={source} shopHref={`${vintageEntryPath}?from=${sampleShopSource}`}
      socialLinks={candidates.map(profile => ({ name: profile.name, href: vintageDemoHref(`buddy-${profile.id}`, profile.id) }))} />
  </main>;
}
