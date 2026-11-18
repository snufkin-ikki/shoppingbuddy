import type { Metadata } from "next";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import { profiles } from "../directory-data";
import BuddyNetwork from "./BuddyNetwork";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Buddyの紹介・招待 | Shopping Buddy",
  description: "一緒に街を歩いたら面白そうな知り合いを、Shopping Buddyへ。",
  robots: { index: false },
};

export default async function BuddyNetworkPage({ searchParams }: {
  searchParams: Promise<{ buddy?: string; invite?: string; view?: string }>;
}) {
  const query = await searchParams;
  const invite = query.invite === "1";
  const operations = query.view === "operations";
  const buddy = profiles.find(profile => profile.id === query.buddy);
  const path = operations ? "/buddy-network?view=operations"
    : buddy ? "/buddy-network?buddy=" + encodeURIComponent(buddy.id) : "/buddy-network";
  const user = invite ? null : await getChatGPTUser();
  return <main lang="ja" className="vintage-entry buddy-finder">
    <header className="vintage-header">
      <a href="/" aria-label="Shopping Buddy トップ"><img src="/shopping-buddy-logo-final.png" width={230} height={42} alt="Shopping Buddy" /></a>
      <a href={buddy ? "/#" + buddy.id : "/#directory"}>{buddy ? "プロフィールへ戻る" : "Buddy一覧へ"}</a>
    </header>
    <section className="buddy-finder-panel">
      <h1>{invite ? "Shopping Buddyへの招待" : operations ? "Buddyの紹介・招待を管理" : buddy ? buddy.name + "を紹介する" : "Buddyの紹介・招待"}</h1>
      {!invite && !operations && <p className="buddy-finder-lead">この人と街を歩いたら面白そう。そんな知り合いを、あなたの言葉で紹介してください。</p>}
      {invite || user
        ? <BuddyNetwork mode={invite ? "invite" : operations ? "operations" : "member"} initialBuddy={buddy?.id} />
        : <a className="buddy-finder-link" href={chatGPTSignInPath(path)} target="_top">ChatGPTでログイン</a>}
    </section>
  </main>;
}
