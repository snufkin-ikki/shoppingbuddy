"use client";

import { GenrePictogram, genreLabel } from "./genre-pictograms";
import InterviewDiscovery from "./InterviewDiscovery";
import TravelDestinations from "./TravelDestinations";
import BuddyUsageFlow from "./BuddyUsageFlow";
import ProfileShare from "./ProfileShare";
import BuddySocialConnections from "./BuddySocialConnections";
import TodayWalk, { type WalkStage } from "./TodayWalk";
import BudgetAlternatives from "./BudgetAlternatives";
import BuddyIntroductions from "./BuddyIntroductions";
import UserVoice from "./UserVoice";
import { buddySearchRequestHref } from "./buddy-search-request";
import { siteLanguage, type SiteLanguage } from "./site-language";
import { walkStories, walkStoryCopy } from "./buddy-walk-stories";
import { currentVintageSource, recordVintageDemoStep, vintageEntryId, vintageEntryPath, vintageFilters } from "./shimokitazawa-entry";
import { validVintageSlot, vintageWalkDuration, vintageWalkTitle } from "./shimokitazawa-slots";
import { PocWeeklySummary, usePocDemo } from "./poc-demo";
import ProfileWindows from "./ProfileWindows";
import { ageDecades, knownExactAges, occupations } from "./buddy-discovery-filters";
import { areas, categories, profiles, filterProfiles, respectFeeWithTax, mediaFeatures, walkExamples, walkStyles } from "./directory-data";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

const buddyTerms = {
  ja: { passion: "このBuddyの偏愛", more: "ほかの偏愛を見る", fee: "リスペクトフィー", definition: "リスペクトフィーは、Buddyと過ごす時間の利用料金です。お支払い先はShopping Buddyです。" },
  en: { passion: "What this Buddy loves", more: "See more interests", fee: "Respect fee", definition: "The respect fee covers time spent with your Buddy and is paid to Shopping Buddy." },
  zh: { passion: "这位伙伴的热爱", more: "查看更多兴趣", fee: "同行酬谢费", definition: "同行酬谢费是你与 Buddy 一起逛街的费用，款项支付给 Shopping Buddy。" },
};

const buddies = [
  { id: 1, name: "あや", emoji: "👩🏻", interests: "古着・カフェ・音楽", walk: "徒歩2分", time: "15:20", color: "#ffe1cf" },
  { id: 2, name: "けんた", emoji: "👨🏻", interests: "雑貨・本・コーヒー", walk: "徒歩3分", time: "15:20", color: "#d8ecff" },
  { id: 3, name: "みさ", emoji: "👩🏻‍🦱", interests: "カフェ・スイーツ・雑貨", walk: "徒歩4分", time: "15:40", color: "#fff0bd" },
];
const launchAreas = ["下北沢","渋谷・原宿","浅草・蔵前","秋葉原","神保町","京都","大阪・心斎橋","名古屋・栄","福岡・天神","仙台","札幌"];

const requestAreaAliases: Record<string, string> = {
  渋谷: "渋谷・原宿", 原宿表参道: "渋谷・原宿", 表参道: "渋谷・原宿",
  浅草: "浅草・蔵前", 京都河原町: "京都", 名古屋栄: "名古屋・栄",
  博多天神: "福岡・天神", 福岡天神: "福岡・天神",
};

const requestPreferences = [
  { label: "お店選びはおまかせ", title: "お店選びはおまかせで、この街のおすすめを一緒にのぞきたい" },
  { label: "気になる店がある", title: "気になるお店があるので、そのお店を中心に一緒に歩きたい" },
  { label: "歩きながら話したい", title: "街をゆっくり歩きながら、詳しいBuddyと話してみたい" },
];

const requestExamples = [
  { label: "古着屋をめぐる", title: "古着屋を一緒にめぐって、気になる一着を探したい" },
  { label: "出張の空き時間", title: "出張の空き時間に、その街ならではの雑貨屋をのぞきたい" },
  { label: "本屋をのぞく", title: "地元に詳しいBuddyと本屋をめぐって、気になる一冊を見つけたい" },
];

function GenreLabels({ ids }: { ids: string[] }) {
  return <div className="profile-genres" aria-label="大カテゴリー">
    {categories.filter(genre => ids.includes(genre.id)).map(genre =>
      <span key={genre.id} style={{ borderInlineStartColor: genre.color }}>
        {genre.id} <small>{genre.label}</small>
      </span>)}
  </div>;
}

type ProfileSection = "overview" | "media";

const requestFieldErrors = {
  "request-title": "どんな時間を過ごしたいか、一言入力してください。",
  "request-area": "希望の募集エリアを選んでください。",
  "request-datetime": "街歩きをしたい日時を選んでください。",
};
type RequestField = keyof typeof requestFieldErrors;
const requestTimeLabel = "街歩きをしたい日時";
const requestDeadlineLabel = "応募受付期限";


type RequestDetails = {
  title: string;
  area: string;
  when: string;
  duration: string;
  deadline: string;
};


const requestDraftKey = "shopping-buddy-request-draft-v1";
const bookmarkStorageKey = "shopping-buddy-bookmarks-v1";
const minRequestMinutes = 60;
const maxRequestMinutes = 12 * 60;
const requestStepMinutes = 30;
const requestMinutes = Object.fromEntries(
  Array.from({ length: (maxRequestMinutes - minRequestMinutes) / requestStepMinutes + 1 }, (_, index) => {
    const minutes = minRequestMinutes + index * requestStepMinutes;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return [`${hours}時間${remainder ? `${remainder}分` : ""}`, minutes];
  }),
);
const requestDefaults = { title: "", area: "下北沢", when: "今すぐ", dateTime: "", duration: "1時間", deadline: "24時間" };

const directoryExtras = {
  ja: { halfHour: "30分", saved: "保存したBuddy", save: "あとで見る", remove: "保存を解除", empty: "保存したBuddyはまだいません。一覧の「あとで見る」で保存できます。" },
  en: { halfHour: "30 min", saved: "Saved Buddies", save: "Save for later", remove: "Remove saved Buddy", empty: "No saved Buddies yet. Save one to find them here." },
  zh: { halfHour: "30分钟", saved: "已收藏的同伴", save: "收藏", remove: "取消收藏", empty: "还没有收藏的同伴。可以从列表中收藏。" },
};

const comparisonStorageKey = "shopping-buddy-comparison";

const comparisonCopy = {
  ja: { add: "＋ 比較に追加", added: "✓ 比較に追加済み", compare: "比較する", title: "Buddyを比較", summary: "リスペクトフィーと所要時間", hint: "名前を押すと詳しい情報が切り替わります", back: "比較に戻る", close: "閉じる", remove: "比較から外す", interests: "得意なこと", media: "掲載・監修実績", empty: "一覧からBuddyを追加できます。", limit: "最大3人まで" },
  en: { add: "+ Add to compare", added: "✓ Added to comparison", compare: "Compare", title: "Compare buddies", summary: "Fees and duration", hint: "Select a name to see their details", back: "Back to comparison", close: "Close", remove: "Remove from comparison", interests: "Interests", media: "Media features", empty: "Add buddies from the directory.", limit: "Up to 3 buddies" },
  zh: { add: "＋ 加入比较", added: "✓ 已加入比较", compare: "比较", title: "比较同伴", summary: "费用与时长", hint: "点按姓名查看详细信息", back: "返回比较", close: "关闭", remove: "从比较中移除", interests: "擅长领域", media: "媒体报道与监修", empty: "可以从列表添加同伴。", limit: "最多比较3人" },
};

const walkIdeas = [
  { area: "下北沢", category: "衣", query: "古着", label: { ja: "下北沢で古着屋めぐり", en: "Vintage shops in Shimokitazawa", zh: "在下北泽逛古着店" } },
  { area: "神保町", category: "遊", query: "古本", label: { ja: "神保町で古本屋めぐり", en: "Used bookstores in Jimbocho", zh: "在神保町逛旧书店" } },
  { area: "表参道", category: "美", query: "コスメ", label: { ja: "表参道でコスメ探し", en: "Cosmetics shopping in Omotesando", zh: "在表参道挑选化妆品" } },
];

const browseCopy = {
  ja: {
    broaden: "条件を1つだけ広げて探す",
    noAlternative: "別のキーワードを試すか、条件をクリアして探せます。",
    nearbyBuddies: "同じ街・ジャンルのバディ",
    clearQuery: "キーワード",
    clearGender: "性別",
    removeFilter: "条件を外す",
    clearCategory: "ジャンル",
    clearArea: "エリア",
    viewAll: "すべてのバディを見る",
  },
  en: {
    broaden: "Change one filter to find more buddies",
    noAlternative: "Try a different keyword or clear your filters.",
    nearbyBuddies: "Buddies in the same area and category",
    clearQuery: "Keyword",
    clearGender: "Gender",
    removeFilter: "Remove filter",
    clearCategory: "Category",
    clearArea: "Area",
    viewAll: "View all buddies",
  },
  zh: {
    broaden: "放宽一项条件，继续寻找",
    noAlternative: "请尝试其他关键词或清除筛选条件。",
    nearbyBuddies: "同一区域与类别的同伴",
    clearQuery: "关键词",
    clearGender: "性别",
    removeFilter: "移除筛选条件",
    clearCategory: "类别",
    clearArea: "区域",
    viewAll: "查看所有同伴",
  },
};

function focusBuddyResults() {
  const toolbar = document.getElementById("buddy-search-results");
  toolbar?.focus({ preventScroll: true });
  toolbar?.scrollIntoView({ block: "start" });
}

const coverBadgeLinks: Record<string, readonly [string, string?]> = {
  "ayano-tominaga": ["https://x.com/ayanotdo", "https://www.instagram.com/ayanotdo/"],
  "takashi-onizawa": ["https://www.instagram.com/creativedesign/"],
};

function CoverBadges({ profile }: { profile: typeof profiles[number] }) {
  return (
    <span className="cover-badges">
      {profile.coverBadges.map((label, index) => {
        const href = coverBadgeLinks[profile.id]?.[index];
        const title = /^(Instagram|X) /.test(label) ? "フォロワー数はご提供資料の表示値です" : undefined;
        return href
          ? <a key={label} href={href} title={title} target="_blank" rel="noopener noreferrer">{label}</a>
          : <span key={label} title={title}>{label}</span>;
      })}
    </span>
  );
}


const instagramAccounts: Partial<Record<string, string>> = {
  "ayano-tominaga": "ayanotdo",
  ucci: "uccicreatist",
  "tetsuya-oi": "ted000000001",
  "takashi-onizawa": "creativedesign",
  "akiko-kobayashi": "kobayashi_akiko.official",
};
const attendantProfiles: Record<string, { bio: string; instagram?: string; languages?: string }> = {
  "keita-yanagawa": {
    bio: "ミリタリー古着や色落ちしたTシャツ、リメイクされたヴィンテージが好き。服の背景や、サイズ・色の組み合わせを話しながら街を歩けます。",
    instagram: "yanagirv",
  },
  "kohei-miyata": {
    bio: "記者・編集者を経てマーケターに。モデルやポールダンサーとしても活動し、ジェンダーレスでミニマルな装いや、モードとストリートを合わせたスタイルを好みます。",
    instagram: "kyoko_miyae",
    languages: "日本語 / English / Deutsch",
  },
  "kenji-takahashi": {
    bio: "関東での暮らしを経て北九州へUターン。アパレル販売の経験を活かした小さいサイズの服選びや、福岡のうどん店、地元の街歩きについて話せます。",
    languages: "日本語 / English（英語での同行も相談可）",
  },
  "yukio-coffee": {
    bio: "ユニクロや無印良品を軸に、セレクトショップの服も取り入れた大人カジュアルを発信。低身長コーデや、手持ちの服にも合わせやすい着こなしが得意です。",
    instagram: "yukio_coffee",
  },
  "motoki-fujikawa": {
    bio: "五つ星ジーンズソムリエ。国産ジーンズやヴィンテージデニムの歴史、縫製や仕様の違いを探求し、その魅力を国内外に発信しています。ジーンズ・ヘリテイジ・サミットの発起人です。",
    instagram: "mtk0058",
  },
  "kotaro-shinada": {
    bio: "アパレルの商品企画やバイイングを経て、ブランドや商品開発のディレクションに携わる。古着物を生かすアップサイクルブランドにも関わり、京都のセレクトショップや喫茶店が好きです。",
    instagram: "kotaroshinada",
  },
  "kodai-yasuno": {
    bio: "一点ものの染色アパレルブランド「KODAI YASUNO」を展開。藍染や絞り染めなどの技法を用い、服に新たな表情を加えています。",
  },
  "makoto-tokuda": {
    bio: "VANSやオールドスケート、ヴィンテージデニムが好き。靴のデザインと制作を学び、古着とストリートを組み合わせるスタイルや、リユースショップでのアイテム選びを得意としています。",
  },
  "minoru-doi": {
    bio: "アパレル販売、エンジニア、Webデザイナーを経て、企画や事業づくりに携わる。長崎では、地元企業と都市部の企業をつなぐ「おさかなサブスク」に取り組みました。",
    instagram: "doidoi3000",
  },
  "kiyotaka-yamana": {
    bio: "「ミズベリング」などを手がけるプロデューサー。ユニクロやZARAなど身近なブランドを活かした、清潔感と遊び心のある大人の装いが得意です。",
    instagram: "kiyotaka_yamana",
  },
};
const englishSpeakingBuddies = new Set(["ucci", "akiko-kobayashi", "kohei-miyata", "kenji-takahashi"]);
const takaraVideo = "https://youtu.be/Zs380a4MRvA";

const ayanoFeedTopics = ["スマートフォン", "展示会のひとこま", "スマホ撮影", "端末レビュー", "カメラ付きスマホ", "海外イベント", "ポータブルゲーム", "カメラ", "モビリティ", "ロボット", "スマートフォン", "薄型端末"];
function InstagramPreview({ account }: { account: string }) {
 const ted=account==="ted000000001";
 const ucci=account==="uccicreatist";
 const onizawa=account==="creativedesign";
 const akiko=account==="kobayashi_akiko.official";
 const twoRows=ted || onizawa || akiko;
 const feedTopics=akiko?["着物","和装とトロフィー","新聞掲載","SHŌGUN","和装でのひとこま","舞台"]:onizawa?["アート展","インテリア空間","家具ショールーム","インテリア模型","アートと空間","メディア掲載"]:ted?["スパルタンレース", "ランニング", "Fire Jump", "Slip Wall", "ウエイト運び", "Twister"]:ucci?["イベント", "街の風景", "アウトドア", "車と音楽", "音楽カルチャー", "キャンピングトレーラー", "ファッション", "ガジェット", "レコード", "デバイス", "ゴルフ", "アウトドア"]:ayanoFeedTopics;
 const accountUrl=`https://www.instagram.com/${account}/`;
  const [expanded,setExpanded]=useState(false);
  return <section className="instagram-preview" lang="ja" aria-label={`${account}のInstagram投稿プレビュー`}>
    <div className="instagram-preview-heading"><div><span className="instagram-eyebrow">INSTAGRAM</span><a href={accountUrl} target="_blank" rel="noopener noreferrer">@{account} ↗</a></div><span>発信から知る、この人</span></div>
    <div className="instagram-preview-grid">{feedTopics.slice(0,expanded?12:6).map((topic,i)=><a className="instagram-preview-tile" key={i} href={accountUrl} target="_blank" rel="noopener noreferrer" aria-label={`${topic}の投稿プレビュー。Instagramプロフィールを開く`}><span role="img" aria-label={topic} style={{backgroundSize:twoRows?"300% 200%":"300% 400%",backgroundImage:`url(${akiko?"/akiko-kobayashi-feed.jpeg":onizawa?"/onizawa-feed.jpeg":ted?"/ted-feed.jpeg":ucci?"/ucci-feed.jpeg":"/ayano-instagram-feed.jpeg"})`,backgroundPosition:`${(i%3)*50}% ${Math.floor(i/3)*100/(twoRows?1:3)}%`}} /></a>)}</div>
    <div className="instagram-topics">{(akiko?["着物","和装","リユース着物"]:onizawa?["インテリア","家具","アート"]:ted?["スパルタンレース","トレーニング","アウトドア"]:ucci?["ファッション","音楽","アウトドア"]:["スマートフォン","ガジェット","海外展示会"]).map(t=><span key={t}>{t}</span>)}</div><p className="instagram-preview-note">ご提供の投稿画像より掲載。各画像からInstagramプロフィールへ移動します。</p>{feedTopics.length>6 && <button type="button" className="instagram-expand" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded?"閉じる −":"投稿をもっと見る ＋"}</button>}
  </section>;
}

function UcciPortrait(){return <img className="ucci-portrait" src="/ucci-seaside-wide.png" alt="海辺で黒いレザージャケットを着た内田洋茂さん"/>}

function TedPortrait(){return <img className="ted-outdoor-portrait" src="/ted-outdoor-profile.jpeg" alt="屋外でロープを使い体を動かす大井てつやさん"/>}

function MariCollage(){return <div className="mari-collage" role="img" aria-label="熊谷真理さんのメイク、コスメとポートレート">{[[0,0,697,322],[697,0,509,434],[0,322,697,871],[697,434,509,759]].map(([x,y,w,h],i)=><svg key={i} viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio={i===1||i===2?"none":"xMidYMid slice"} aria-hidden="true"><svg x={x} y={y} width={w} height={h} viewBox={`${x} ${y} ${w} ${h}`} overflow="hidden"><image href="/mari-collage-clean.png" width="1206" height="1193" /></svg></svg>)}</div>}


export default function Home() {
  const [locale, setLocale] = useState<SiteLanguage>("ja");
  const walkCopy = walkStoryCopy[locale];

  useEffect(() => {
    const readLanguage = () => setLocale(siteLanguage(new URLSearchParams(location.search).get("lang")));
    readLanguage();
    window.addEventListener("popstate", readLanguage);
    return () => window.removeEventListener("popstate", readLanguage);
  }, []);

  function changeLanguage(value: string) {
    const language = siteLanguage(value);
    const url = new URL(location.href);
    if (language === "ja") url.searchParams.delete("lang");
    else url.searchParams.set("lang", language);
    history.replaceState(history.state, "", url);
    setLocale(language);
  }
  useEffect(()=>{const saved=localStorage.getItem("shopping-buddy-locale");if(saved==="en"||saved==="zh")setLocale(saved);},[]);
  useEffect(()=>{localStorage.setItem("shopping-buddy-locale",locale);document.documentElement.lang=locale;},[locale]);
  const copy = {
    ja:{location:"下北沢駅周辺⌄",heroEyebrow:"SHOPPING BUDDY",heroTop:"その偏愛と、",heroBottom:"街を歩こう。",heroLead:"下北沢の古着屋を店主とめぐる。神保町の路地を書店に詳しい人と歩く。街やカルチャーに「偏愛」を持つ相方と、街歩きやウインドウショッピングを楽しむサービスです。",purchaseNote:"見るだけでもOK。買い物は必須ではありません。",interests:"好きなこと・偏愛から探す",directoryTitle:"どの街で、誰と歩く？",directoryLead:"クリエイターそれぞれの偏愛から、気が合いそうな街歩きの相方を探そう。",genreTitle:"好きなジャンルから探す",allGenres:"すべてのジャンル",keyword:"名前・好きなこと",keywordPlaceholder:"古着、本、サウナ、名前など",city:"都市・エリア",allAreas:"すべてのエリア",gender:"性別",allGenders:"すべての性別",filterNote:"エリアは登録済みタグをもとに表示しています。実際の対応場所・日時は要確認です。",results:"人のバディ",clear:"条件をクリア",sort:"並び順",registered:"登録順",newest:"新着順",priceSort:"リスペクトフィーが低い順",profilePrice:"プロフィールを見る →",back:"← 一覧に戻る"},
    en:{location:"Near Shimokitazawa Station⌄",heroEyebrow:"SHOPPING BUDDY",heroTop:"Take an hour,",heroBottom:"walk the neighborhood.",heroLead:"Vintage, books, cafés. Walk and window-shop with a creator who loves what you love.",purchaseNote:"Browsing is welcome. You can enjoy the walk without buying anything.",interests:"Explore by interest",directoryTitle:"Where would you like to walk?",directoryLead:"Find a companion by neighborhood and interests.",genreTitle:"Start with a category you love.",allGenres:"All categories",keyword:"Name or interests",keywordPlaceholder:"Vintage, books, sauna, a name…",city:"City / neighborhood",allAreas:"All areas",gender:"Gender",allGenders:"Any gender",filterNote:"Areas are based on registered profile tags. Please confirm availability and meeting details.",results:" buddies",clear:"Clear filters",sort:"Sort by",registered:"Registration order",newest:"Newest",priceSort:"Lowest respect fee",profilePrice:"Profile & rates →",back:"← Back to directory"},
    zh:{location:"下北泽站附近⌄",heroEyebrow:"SHOPPING BUDDY",heroTop:"留出一小时，",heroBottom:"逛逛这座城市。",heroLead:"古着、书籍、咖啡馆。和热爱这些事物的创作者一起漫步、逛街。",purchaseNote:"只逛逛也欢迎，购买商品由您决定。",interests:"按兴趣探索",directoryTitle:"想和谁逛哪条街？",directoryLead:"按区域和兴趣寻找你的城市同伴。",genreTitle:"先从喜欢的类别开始。",allGenres:"全部类别",keyword:"姓名或兴趣",keywordPlaceholder:"古着、书籍、桑拿或姓名…",city:"城市 / 区域",allAreas:"所有区域",gender:"性别",allGenders:"不限性别",filterNote:"区域依据个人资料中登记的标签显示。集合地点和时间请另行确认。",results:"位同伴",clear:"清除筛选",sort:"排序",registered:"登记顺序",newest:"最新登记",priceSort:"按同行酬谢费从低到高",profilePrice:"查看资料与费用 →",back:"← 返回列表"}
  }[locale];
  const [query,setQuery] = useState("");
  const [area,setArea] = useState("");
  const [category,setCategory] = useState("");
  const [gender,setGender] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [sort,setSort] = useState("registered");
  const [page,setPage] = useState(1);
  const [profileView, setProfileView] = useState<{id: string; section: ProfileSection} | null>(null);
  const detail = profileView?.id ?? null;
  const directoryOrigin = useRef<{id: string; section: ProfileSection} | null>(null);
  const returnToDirectory = useRef(false);
  const { events: demoEvents, record: recordDemo } = usePocDemo();
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const extras = directoryExtras[locale];
  const matches = useMemo(() => filterProfiles(query, area, gender, sort, category, age, occupation),
    [query, area, gender, sort, category, age, occupation]);
  const results = savedOnly ? matches.filter(profile => savedIds.includes(profile.id)) : matches;

  useEffect(() => {
    function restoreBookmarks() {
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(bookmarkStorageKey) ?? "[]");
        if (Array.isArray(stored)) setSavedIds(stored.filter((id): id is string => typeof id === "string" && profiles.some(profile => profile.id === id)));
      } catch {
        // Bookmarks remain usable for the current page when storage is blocked.
      }
    }
    restoreBookmarks();
    window.addEventListener("storage", restoreBookmarks);
    return () => window.removeEventListener("storage", restoreBookmarks);
  }, []);

  function bookmarkButton(id: string) {
    const saved = savedIds.includes(id);
    return <button type="button" className="compare-add bookmark-button" aria-pressed={saved} onClick={() => {
      const next = saved ? savedIds.filter(candidate => candidate !== id) : [...savedIds, id];
      setSavedIds(next);
      if (savedOnly) setPage(1);
      try { localStorage.setItem(bookmarkStorageKey, JSON.stringify(next)); } catch {}
    }}>{saved ? extras.remove : extras.save}</button>;
  }

  const selectedWalkIdea = walkIdeas.find(idea => area === idea.area && category === idea.category && query === idea.query && !gender);
  const browse = browseCopy[locale];
  const comparison = comparisonCopy[locale];
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [comparisonRestored, setComparisonRestored] = useState(false);
  const [activeComparisonId, setActiveComparisonId] = useState("");
  const [comparisonProfileId, setComparisonProfileId] = useState("");
  const compareDialog = useRef<HTMLDialogElement>(null);
  const compareDockButton = useRef<HTMLButtonElement>(null);
  const compareProfiles = compareIds.flatMap(id => profiles.filter(profile => profile.id === id));
  const currentComparisonId = compareIds.includes(activeComparisonId) ? activeComparisonId : compareIds[0];

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(comparisonStorageKey) ?? "null");
      if (Array.isArray(stored)) {
        const validIds = stored.filter((id): id is string =>
          typeof id === "string" && profiles.some(profile => profile.id === id));
        setCompareIds([...new Set(validIds)].slice(0, 3));
      }
    } catch {
      // The comparison still works in memory if browser storage is unavailable.
    }
    setComparisonRestored(true);
  }, []);

  useEffect(() => {
    if (!comparisonRestored) return;
    try {
      sessionStorage.setItem(comparisonStorageKey, JSON.stringify(compareIds));
    } catch {
      // Storage can be blocked by browser settings.
    }
  }, [comparisonRestored, compareIds]);

  function comparisonButton(id: string) {
    const selected = compareIds.includes(id);
    const atLimit = !selected && compareIds.length >= 3;
    return <button type="button" className="compare-add" aria-pressed={selected} disabled={atLimit}
      onClick={() => {
        setCompareIds(current => current.includes(id)
          ? current.filter(candidate => candidate !== id)
          : current.length < 3 ? [...current, id] : current);
        if (!selected && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
          requestAnimationFrame(() => {
            const button = compareDockButton.current;
            if (!button) return;
            button.getAnimations().forEach(animation => animation.cancel());
            button.animate([{ opacity: 0.8, transform: "scale(.97)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }], { duration: 280 });
          });
        }
      }}>
      {selected ? comparison.added : atLimit ? comparison.limit : comparison.add}
    </button>;
  }

  const advanced = {
    ja: { title: "詳細条件", age: "年代・年齢", allAges: "すべての年代・年齢", decade: "年代", exact: "年齢", occupation: "職業・活動", allOccupations: "すべての職業・活動", note: "年代・年齢は、公開情報で確認できるBuddyが対象です。" },
    en: { title: "More filters", age: "Age group or age", allAges: "Any age", decade: "Age group", exact: "Exact age", occupation: "Occupation or activity", allOccupations: "Any occupation or activity", note: "Age filters apply to Buddies with publicly verified age information." },
    zh: { title: "更多筛选", age: "年龄段或年龄", allAges: "不限年龄", decade: "年龄段", exact: "具体年龄", occupation: "职业或活动", allOccupations: "不限职业或活动", note: "年龄筛选适用于已通过公开资料确认年龄的伙伴。" },
  }[locale];
  const decadeLabel = (value: number) => ({ ja: `${value}代`, en: `${value}s`, zh: `${value}–${value + 9} 岁` })[locale];
  const exactAgeLabel = (value: number) => ({ ja: `${value}歳`, en: `${value} years old`, zh: `${value} 岁` })[locale];
  const ageOptions = knownExactAges();
  const ageText = age.startsWith("exact:") ? exactAgeLabel(Number(age.slice(6))) : decadeLabel(Number(age.slice(7)));
  const occupationText = occupations[occupation as keyof typeof occupations]?.[locale];
  const activeFilters = ([
    { label: browse.clearQuery, value: query.trim(), clear: setQuery, remaining: ["", area, gender, sort, category, age, occupation] },
    { label: browse.clearCategory, value: category, clear: setCategory, remaining: [query, area, gender, sort, "", age, occupation] },
    { label: browse.clearArea, value: area, clear: setArea, remaining: [query, "", gender, sort, category, age, occupation] },
    { label: browse.clearGender, value: gender, clear: setGender, remaining: [query, area, "", sort, category, age, occupation] },
    { label: advanced.age, value: age ? ageText : "", clear: setAge, remaining: [query, area, gender, sort, category, "", occupation] },
    { label: advanced.occupation, value: occupationText ?? "", clear: setOccupation, remaining: [query, area, gender, sort, category, age, ""] },
  ] satisfies Array<{
    label: string;
    value: string;
    clear: (value: string) => void;
    remaining: Parameters<typeof filterProfiles>;
  }>).filter(filter => filter.value);
  const alternatives = results.length === 0 ? activeFilters.map(filter => ({
    ...filter,
    count: filterProfiles(...filter.remaining).filter(profile => !savedOnly || savedIds.includes(profile.id)).length,
  })).filter(option => option.count > 0) : [];

  function removeSearchFilter(clear: (value: string) => void) {
    clear("");
    setPage(1);
    focusBuddyResults();
  }
  const viewedProfile = profiles.find(profile => profile.id === detail);
  const walkStory = detail ? walkStories[detail]?.[locale] : undefined;
  const mediaAccount = detail ? instagramAccounts[detail] : undefined;
  const profileArea = viewedProfile?.areas.find(place => place === area) ?? viewedProfile?.areas[0];
  const sharedAreas = viewedProfile?.areas.some(place => place === area) ? [area] : viewedProfile?.areas ?? [];
  const sharedCategories = viewedProfile?.categories.includes(category) ? [category] : viewedProfile?.categories ?? [];
  const relatedBuddies = viewedProfile ? profiles.filter(profile => profile.id !== detail)
    .map(profile => ({
      profile,
      area: sharedAreas.find(candidate => profile.areas.some(place => place === candidate)),
      category: sharedCategories.find(candidate => profile.categories.includes(candidate)),
    }))
    .filter(candidate => candidate.area && candidate.category)
    .slice(0, 3) : [];

  function browseTravelArea(destination: string) {
    setProfileView(null);
    resetFilters();
    setArea(destination);
    history.pushState(null, "", "#buddy-search-results");
    requestAnimationFrame(focusBuddyResults);
  }

  function resetFilters(){setCategory("");setQuery("");setArea("");setGender("");setAge("");setOccupation("");setSavedOnly(false);setPage(1);}
  function selectWalkIdea(idea: (typeof walkIdeas)[number]) {
    setArea(idea.area);
    setCategory(idea.category);
    setQuery(idea.query);
    setGender("");
    setAge("");
    setOccupation("");
    setPage(1);
    focusBuddyResults();
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("entry") !== vintageEntryId) return;
    recordVintageDemoStep("visit");
    setArea(vintageFilters.area);
    setCategory(vintageFilters.category);
    setQuery(vintageFilters.query);
    if (location.hash === "#public-board") {
      setRequestArea(vintageFilters.area);
      setRequestTitle(current => current || vintageWalkTitle);
      setRequestDuration(vintageWalkDuration);
      const slot = params.get("slot");
      if (slot && validVintageSlot(slot)) {
        setRequestWhen("日時を指定");
        setRequestDateTime(slot);
        setRequestSearchNote("選んだサンプル日時と所要時間を入れました。日時は日本時間です。");
        recordVintageDemoStep("slot");
        focusRequestSection("request-datetime");
      } else {
        setRequestSearchNote(slot ? "選んだサンプル日時は終了しました。希望の日時を選び直してください。" : "下北沢・古着屋めぐり・1時間を特集から引き継ぎました。");
        if (slot) setRequestWhen("日時を指定");
        focusRequestSection(slot ? "request-datetime" : "request-when");
      }
    }
  }, []);

  useEffect(() => {
    if (detail) recordVintageDemoStep("profile");
  }, [detail]);

  useEffect(() => {
    if (selectedWalkIdea !== walkIdeas[0] || location.hash !== "#buddy-search-results") return;
    if (new URLSearchParams(location.search).get("entry") === vintageEntryId) focusBuddyResults();
  }, [selectedWalkIdea]);

  function openProfile(id: string, section: ProfileSection = "overview") {
    setProfileView({ id, section });
    history.pushState(null, "", `#${id}${section === "media" ? "/media" : ""}`);
  }

  function openDirectoryProfile(id: string, section: ProfileSection = "overview") {
    directoryOrigin.current = { id, section };
    openProfile(id, section);
  }

  function backToDirectory() {
    returnToDirectory.current = true;
    history.replaceState(null, "", "#directory");
    setProfileView(null);
  }

  useEffect(() => {
    function readHash() {
      const hash = location.hash.slice(1);
      if (hash === "public-board") recordVintageDemoStep("request");
      const isMedia = hash.endsWith("/media");
      const id = isMedia ? hash.slice(0, -"/media".length) : hash;
      if (profiles.some(profile => profile.id === id)) {
        setProfileView({ id, section: isMedia && (mediaFeatures[id]?.length || instagramAccounts[id] || id === "mimic-takara") ? "media" : "overview" });
      } else {
        if (hash && hash !== "directory") directoryOrigin.current = null;
        setProfileView(null);
      }
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("popstate", readHash);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("popstate", readHash);
    };
  }, []);

  useEffect(() => {
    if (profileView) {
      const targetId = profileView.section === "media" ? "profile-media" : "profile-detail";
      const target = document.getElementById(targetId);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }

    const origin = directoryOrigin.current;
    if (!origin && !returnToDirectory.current) return;
    directoryOrigin.current = null;
    returnToDirectory.current = false;
    const card = origin && document.getElementById(`directory-card-${origin.id}`);
    const control = card && card.querySelector<HTMLElement>(
      origin.section === "media" ? ".media-availability" : ".detail-button",
    );
    const target = control || document.getElementById("directory-title");
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ behavior: "instant", block: control ? "center" : "start" });
  }, [profileView]);

  const [fx, setFx] = useState<{rate: number; date: string} | null>(null);
  const [fxError, setFxError] = useState(false);
  useEffect(() => {
    let active = true;
    let pending = false;
    let controller: AbortController | null = null;
    async function refresh() {
      if (pending) return;
      pending = true;
      controller = new AbortController();
      const requestController = controller;
      const timeout = setTimeout(() => requestController.abort(), 15000);
      try {
        const response = await fetch("https://api.frankfurter.dev/v2/rate/JPY/USD", {signal: requestController.signal});
        if (!response.ok) throw new Error("Rate unavailable");
        const data = await response.json();
        if (data.base !== "JPY" || data.quote !== "USD" || typeof data.rate !== "number" || !Number.isFinite(data.rate) || data.rate <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error("Invalid rate");
        if (active) { setFx({rate: data.rate, date: data.date}); setFxError(false); }
      } catch { if (active) setFxError(true); }
      finally {clearTimeout(timeout); pending = false;}
    }
    refresh();
    const interval = setInterval(refresh, 60 * 60 * 1000);
    return () => { active = false; controller?.abort(); clearInterval(interval); };
  }, []);
  const [btc, setBtc] = useState<{jpy: number; timestamp: string} | null>(null);
  const [btcError, setBtcError] = useState(false);
  useEffect(() => {
    let active = true;
    let pending = false;
    let controller: AbortController | null = null;
    async function refreshBtc() {
      if (pending) return;
      pending = true;
      controller = new AbortController();
      const requestController = controller;
      const timeout = setTimeout(() => requestController.abort(), 15000);
      try {
        const response = await fetch("/api/btc-rate", {signal: requestController.signal});
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json();
        if (typeof data.jpy !== "number" || !Number.isFinite(data.jpy) || data.jpy <= 0 || !Number.isFinite(Date.parse(data.timestamp))) throw new Error("Invalid rate");
        if (active) {setBtc(data); setBtcError(false);}
      } catch {if (active) {setBtc(null); setBtcError(true);}}
      finally {clearTimeout(timeout); pending = false;}
    }
    refreshBtc();
    const interval = setInterval(refreshBtc, 60000);
    return () => {active = false; controller?.abort(); clearInterval(interval);};
  }, []);
  function yenAmount(yen: number | null) {
    if (yen === null) return <strong>{walkCopy.unlisted}</strong>;
    return <strong className="yen-amount">{yen.toLocaleString("ja-JP")}<span>{locale === "ja" ? "円" : "JPY"}</span><small>{{ ja: "（税抜）", en: " (excl. tax)", zh: "（未税）" }[locale]}</small></strong>;
  }

  function convertedPrices(yen: number) {
    return <>
      <span className="usd-price">{fx ? `≈ US$${(yen * fx.rate).toFixed(2)}` : fxError ? "USD換算を取得できません" : "USD換算を取得中…"}</span>
      <span className="btc-price">{btc ? `≈ ${(yen / btc.jpy).toFixed(8)} BTC` : btcError ? "BTC換算を取得できません" : "BTC換算を取得中…"}</span>
    </>;
  }

  function price(yen: number) {
    return <>{yenAmount(yen)}{convertedPrices(yen)}</>;
  }

  function minimumFeeLabel(fee: number) {
    const amount = respectFeeWithTax(fee).toLocaleString("ja-JP");
    return {
      ja: `最低60分（税込${amount}円）・以降30分単位`,
      en: `60 min minimum (¥${amount} incl. tax) · 30 min increments`,
      zh: `至少60分钟（含税${amount}日元）· 之后按30分钟计费`,
    }[locale];
  }

  function profilePrices(profile: (typeof profiles)[number]) {
    const topic = walkStories[profile.id]?.[locale].topic ?? walkStyles[profile.id] ?? walkExamples[profile.id];
    return <>
      {topic && <div className="buddy-passion-story">
        <strong>{{ ja: "偏愛が見える街歩き", en: "A glimpse of this Buddy’s passion", zh: "在漫步中发现伙伴的热爱" }[locale]}</strong>
        <p>{topic}</p>
      </div>}
      <ProfileShare key={profile.id + locale} id={profile.id} name={profile.name} topic={topic} locale={locale} />
      <p className="buddy-fee-label">{buddyTerms[locale].fee}</p>
      <div className="profile-prices">
        <div><small>{extras.halfHour}</small>{price(profile.fee / 2)}</div>
      </div>
      <p className="buddy-fee-definition">{minimumFeeLabel(profile.fee)} · {buddyTerms[locale].definition}</p>
      <details className="inline-help"><summary>{{ ja: "見るだけでも大丈夫？", en: "Can I just browse?", zh: "只逛不买可以吗？" }[locale]}</summary><p>{copy.purchaseNote}</p></details>
    </>;
  }

  const [activeBuddy, setActiveBuddy] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>(["こんにちは！駅前の古着屋から歩きませんか？"]);
  const [publicRequest, setPublicRequest] = useState<(RequestDetails & { id: string; applicants: string[]; selected: string | null; owner: string; entrySource: string | null }) | null>(null);
  const [walkStage, setWalkStage] = useState<WalkStage>("matched");
  const [requestTitle, setRequestTitle] = useState("");
  const [requestArea, setRequestArea] = useState("下北沢");
  const [requestWhen, setRequestWhen] = useState("今すぐ");
  const [requestDateTime, setRequestDateTime] = useState("");
  const [requestDuration, setRequestDuration] = useState("1時間");
  const [requestDeadline, setRequestDeadline] = useState("24時間");
  const [invalidRequestField, setInvalidRequestField] = useState<RequestField | null>(null);
  const [requestReview, setRequestReview] = useState<RequestDetails | null>(null);
  const [requestSearchNote, setRequestSearchNote] = useState("");
  const [draftReady, setDraftReady] = useState(false);

  function setDraftFields(draft: typeof requestDefaults) {
    setRequestTitle(draft.title);
    setRequestArea(draft.area);
    setRequestWhen(draft.when);
    setRequestDateTime(draft.dateTime);
    setRequestDuration(draft.duration);
    setRequestDeadline(draft.deadline);
  }

  useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(requestDraftKey) ?? "null");
      if (draft && typeof draft.title === "string" && draft.title.length <= 70
        && (draft.area === "" || launchAreas.includes(draft.area))
        && ["今すぐ", "今日の午後", "日時を指定"].includes(draft.when)
        && typeof draft.dateTime === "string" && (!draft.dateTime || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(draft.dateTime))
        && (draft.duration === "30分" || Object.hasOwn(requestMinutes, draft.duration))
        && ["1時間", "6時間", "24時間", "48時間"].includes(draft.deadline)) {
        setDraftFields({ ...draft, duration: draft.duration === "30分" ? requestDefaults.duration : draft.duration });
        setRequestSearchNote("このタブに保存した下書きを開きました。");
      }
    } catch {
      // The form remains usable without browser storage.
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const draft = { title: requestTitle, area: requestArea, when: requestWhen, dateTime: requestDateTime, duration: requestDuration, deadline: requestDeadline };
    try {
      const changed = Object.entries(requestDefaults).some(([key, value]) => draft[key as keyof typeof draft] !== value);
      if (changed && !publicRequest) sessionStorage.setItem(requestDraftKey, JSON.stringify(draft));
      else sessionStorage.removeItem(requestDraftKey);
    } catch {
      // The form remains usable without browser storage.
    }
  }, [draftReady, publicRequest, requestTitle, requestArea, requestWhen, requestDateTime, requestDuration, requestDeadline]);

  function clearRequestDraft() {
    setDraftFields(requestDefaults);
    setInvalidRequestField(null);
    setRequestSearchNote("");
    focusRequestSection("request-title");
  }


  function focusRequestSection(id: string) {
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "center" });
    });
  }

  function clearRequestError(field: RequestField) {
    setInvalidRequestField(current => current === field ? null : current);
  }

  function requestFieldFeedback(field: RequestField) {
    const invalid = invalidRequestField === field;
    const errorId = `${field}-error`;
    return {
      props: { "aria-invalid": invalid || undefined, "aria-describedby": invalid ? errorId : undefined },
      message: invalid && <p className="request-notice" id={errorId} role="alert">{requestFieldErrors[field]}</p>,
    };
  }

  const titleFeedback = requestFieldFeedback("request-title");
  const areaFeedback = requestFieldFeedback("request-area");
  const dateFeedback = requestFieldFeedback("request-datetime");

  function reviewRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = requestTitle.trim();
    const customTime = requestWhen === "日時を指定";
    const useJapanTime = currentVintageSource() !== null;
    const date = new Date(useJapanTime && requestDateTime ? requestDateTime + "+09:00" : requestDateTime);
    if (!title) {
      setInvalidRequestField("request-title");
      focusRequestSection("request-title");
      return;
    }
    if (!requestArea) {
      setInvalidRequestField("request-area");
      focusRequestSection("request-area");
      return;
    }
    if (customTime && Number.isNaN(date.getTime())) {
      setInvalidRequestField("request-datetime");
      focusRequestSection("request-datetime");
      return;
    }
    const when = customTime ? date.toLocaleString("ja-JP", {
      month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
      ...(useJapanTime ? { timeZone: "Asia/Tokyo" } : {}),
    }) : requestWhen;
    setInvalidRequestField(null);
    setRequestReview({ title, area: requestArea, when, duration: requestDuration, deadline: requestDeadline });
    focusRequestSection("request-review-title");
  }


  function startRequestFromSearch() {
    recordVintageDemoStep("request");
    const requestLocation = launchAreas.includes(area) ? area : requestAreaAliases[area];
    const topic = query.trim() || categories.find(item => item.id === category)?.label || "";
    if (!publicRequest && !requestReview && (area || topic)) {
      const hasDraft = requestTitle.trim() || requestArea !== requestDefaults.area || requestWhen !== requestDefaults.when
        || requestDateTime || requestDuration !== requestDefaults.duration || requestDeadline !== requestDefaults.deadline;
      if (hasDraft) {
        setRequestSearchNote("入力済みの募集内容を表示しています。");
      } else {
        if (area) setRequestArea(requestLocation || "");
        setRequestTitle(topic.slice(0, 70).replace(/[\uD800-\uDBFF]$/, ""));
        const carried = [requestLocation, topic && "検索のテーマ"].filter(Boolean);
        setRequestSearchNote(carried.length
          ? `${carried.join("・")}を検索から引き継ぎました。`
          : "検索結果から募集に移動しました。");
        setInvalidRequestField(area && !requestLocation ? "request-area" : null);
      }
    }
    if (location.hash !== "#public-board") history.pushState(null, "", "#public-board");
    focusRequestSection(publicRequest ? "request-live-title" : requestReview ? "request-review-title" : "request-title");
  }

  const buddy = useMemo(() => buddies.find((item) => item.id === activeBuddy), [activeBuddy]);

  const requestOptions = {
    ja: { offer: "街歩きの相方を探す", offerNote: "得意な街・好きなこと・同行料金を見比べられます。", recruit: "相方を募集する（デモ）", recruitNote: "行きたい街と時間を書いて、募集から待ち合わせまでをデモで試せます。", line: "見つかったらLINEで教えて！", lineNote: "ピンとくるBuddyがいなければ、希望の街・相方・予算を運営に伝えられます。" },
    en: { offer: "Explore Buddy profiles", offerNote: "Compare neighborhoods, interests, and rates.", recruit: "Try posting a walk request", recruitNote: "Choose an area and time, then try the demo from posting to meeting up.", line: "Let me know on LINE", lineNote: "Still looking? Tell our team where you want to go, who you’d like to walk with, and your budget." },
    zh: { offer: "浏览同行伙伴", offerNote: "比较熟悉的街区、兴趣和陪同费用。", recruit: "体验发布同行需求（演示）", recruitNote: "填写地点和时间，体验从发布需求到会合的演示。", line: "找到后通过 LINE 通知我", lineNote: "还没找到合适的伙伴？告诉运营团队你想去的街区、想找的伙伴和预算。" },
  }[locale];

  const pageResults = results.slice((page - 1) * 12, page * 12);
  const lineFinderCard = (
    <a className="directory-line-finder" href={buddySearchRequestHref(area, undefined, locale)}>
      <strong>{requestOptions.line} <span aria-hidden="true">→</span></strong>
      <span>{requestOptions.lineNote}</span>
    </a>
  );

  const selectedDemoProfile = publicRequest?.selected
    ? profiles.find(profile => `${profile.name}（応募デモ）` === publicRequest.selected)
    : undefined;
  const demoDuration = publicRequest ? requestMinutes[publicRequest.duration] : undefined;
  const demoFee = selectedDemoProfile && demoDuration ? respectFeeWithTax(selectedDemoProfile.fee * (demoDuration / 60)) : null;
  const resumeWalk = publicRequest?.selected
    ? ({
      matched: ["街歩きの条件をまとめる", "today-walk-next"],
      agreement: ["リスペクトフィーを確認する", "today-walk-next"],
      planning: ["待ち合わせの入力を続ける", "today-walk-time"],
      scheduled: ["集合場所を確認する", "today-walk-next"],
      meetup: ["待ち合わせを見る", "today-walk-title"],
      met: ["街歩きの完了へ進む", "today-walk-next"],
      completed: ["街歩きの振り返りを見る", "today-walk-title"],
    } satisfies Record<WalkStage, [string, string]>)[walkStage]
    : [publicRequest?.applicants.length ? "応募を見る" : "募集内容を見る", publicRequest?.applicants.length ? "request-applicants" : "request-live-title"];


  function chooseBuddy(id: number) {
    setActiveBuddy(id);
  }

  function sendMessage() {
    if (!message.trim()) return;
    setMessages((current) => [...current, message.trim()]);
    setMessage("");
  }

  return (
    <main lang={locale}>
      <header className="site-header">
        <a className="logo" href="#top" aria-label="Shopping Buddy トップ"><img src="/shopping-buddy-logo-final.png" alt="Shopping Buddy — FREE TIME? FIND A「WINDOW / SHOPPING」PARTNER!" width="300" height="54" /></a>
        <nav className="top-actions" aria-label="メインナビゲーション">
          <label className="language-control"><span className="sr-only">Language</span><select aria-label="Language" value={locale} onChange={e=>changeLanguage(e.target.value)}><option value="ja">日本語</option><option value="en">English</option><option value="zh">中文</option></select></label>
          {publicRequest?.selected && <button className="walk-header-link" type="button"
            onClick={() => focusRequestSection("today-walk-title")}>
            {{ ja: "今日の街歩き", en: "My walk", zh: "我的街区漫步" }[locale]}
          </button>}
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="lead">{copy.heroLead}</p>
        </div>
        <div className="visual-panel">
          <img src="/urban-hero.png" alt="古着店やカフェが並ぶ街を歩く人々" />
          <div className="photo-title">
          <h1><span className="headline-line">{copy.heroTop}</span><span className="headline-line">{copy.heroBottom}</span></h1>
          </div>
          <span className="coral-sticker">{{ja:"気軽にまち歩き",en:"Take a walk",zh:"轻松逛街"}[locale]}</span>
        </div>

          <section className="passion-picker" aria-labelledby="passion-title">
            <h2 id="passion-title">{{ja:<><span>好き</span>なジャンルから探す</>, en:<>Explore by <span>passion</span></>, zh:<>从<span>兴趣</span>类别寻找伙伴</>}[locale]}</h2>
            <div className="passion-grid">{categories.map(c => (
              <button type="button" key={c.id} data-genre={c.id} aria-pressed={category === c.id} onClick={() => {
                setProfileView(null);
                resetFilters();
                setCategory(c.id);
                history.pushState(null, "", "#buddy-search-results");
                requestAnimationFrame(focusBuddyResults);
              }}>
                <span className="passion-symbol">{c.id}</span><GenrePictogram id={c.id} />
                <strong>{genreLabel(c.id, c.label, locale)}</strong>
              </button>
            ))}</div>
          </section>
        <div className="walk-entry-actions">
          <p className="visitor-note">{{ ja: "現在はプロフィールを公開中。同行の予約・決済は準備中です。", en: "Profiles are open to browse. Booking and payment are coming soon.", zh: "现可浏览伙伴资料，预约与支付功能正在准备中。" }[locale]}</p>
          <div className="hero-actions">
            <div className="hero-request-options" id="buddy-request-options">
              <a className="hero-request-option is-primary" href="#directory">
                <strong>{requestOptions.offer} <span aria-hidden="true">→</span></strong>
                <small>{requestOptions.offerNote}</small>
              </a>
              <button className="hero-request-option" type="button" onClick={startRequestFromSearch}>
                <strong>{requestOptions.recruit} <span aria-hidden="true">→</span></strong>
                <small>{requestOptions.recruitNote}</small>
              </button>
            </div>
            <div className="hero-user-links">
              <a className="hero-recruit-link" href="#travel-destinations">
                {{ ja: "街からBuddyを探す", en: "Find a Buddy by city", zh: "按城市寻找伙伴" }[locale]} <span aria-hidden="true">↓</span>
              </a>
              <a className="hero-recruit-link" href="#how-it-works">
                {{ ja: "ご利用の流れ", en: "How it works", zh: "使用流程" }[locale]} <span aria-hidden="true">↓</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      <TravelDestinations locale={locale} onBrowse={browseTravelArea} />
      <BuddyUsageFlow locale={locale} />

      <section className="directory" id="directory" aria-labelledby="directory-title">
        <p className="eyebrow">{detail ? "BUDDY PROFILE" : "FIND YOUR BUDDY"}</p><h2 id="directory-title" tabIndex={-1}>{detail ? (locale==="ja"?"バディのプロフィール":locale==="en"?"Buddy profile":"同伴者资料") : copy.directoryTitle}</h2>
        {!detail && <>
        <p className="directory-lead">{copy.directoryLead}</p>
        <p className="buddy-fee-definition directory-fee-definition">{buddyTerms[locale].definition}</p>
        <div className="walk-ideas" aria-labelledby="walk-ideas-title">
          <h3 id="walk-ideas-title">{{ ja: "1時間の街歩きから探す", en: "Find an hour-long walk", zh: "寻找适合的一小时逛街体验" }[locale]}</h3>
          <div className="walk-ideas-options">
            {walkIdeas.map(idea => (
              <button key={idea.area} type="button" aria-controls="buddy-search-results"
                aria-pressed={selectedWalkIdea === idea}
                onClick={() => selectWalkIdea(idea)}>
                {idea.label[locale]} <span aria-hidden="true">↘</span>
              </button>
            ))}
          </div>
          <a className="vintage-entry-link" href={vintageEntryPath}>下北沢の古着屋めぐり特集を見る →</a>
        </div>

        <InterviewDiscovery locale={locale} />

        <div className="search-panel">
          <label className="keyword-label">{copy.keyword}<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder={copy.keywordPlaceholder} /></label>
          <label>{copy.city}<select value={area} onChange={e=>{setArea(e.target.value);setPage(1);}}><option value="">{copy.allAreas}</option>{areas.map(a=><option key={a}>{a}</option>)}{area && area !== "未設定" && !areas.includes(area) && <option>{area}</option>}<option>未設定</option></select></label>
          <details className="extra-filters">
            <summary>{advanced.title}</summary>
            <div className="extra-filter-fields">
              <label>{copy.gender}
                <select value={gender} onChange={event => { setGender(event.target.value); setPage(1); }}>
                  <option value="">{copy.allGenders}</option>
                  {["男性", "女性", "ノンバイナリー", "自己記述", "未設定"].map(value => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>{advanced.age}
                <select value={age} onChange={event => { setAge(event.target.value); setPage(1); }} aria-describedby="age-filter-note">
                  <option value="">{advanced.allAges}</option>
                  <optgroup label={advanced.decade}>
                    {ageDecades.map(value => <option value={`decade:${value}`} key={value}>{decadeLabel(value)}</option>)}
                  </optgroup>
                  {ageOptions.length > 0 && <optgroup label={advanced.exact}>
                    {ageOptions.map(value => <option value={`exact:${value}`} key={value}>{exactAgeLabel(value)}</option>)}
                  </optgroup>}
                </select>
              </label>
              <label>{advanced.occupation}
                <select value={occupation} onChange={event => { setOccupation(event.target.value); setPage(1); }}>
                  <option value="">{advanced.allOccupations}</option>
                  {Object.entries(occupations).map(([id, labels]) => <option value={id} key={id}>{labels[locale]}</option>)}
                </select>
              </label>
            </div>
            <p className="filter-note" id="age-filter-note">{advanced.note}</p>
          </details>
        </div>
        <div className="area-chips" aria-label="エリアを選ぶ"><button aria-pressed={!area} onClick={()=>{setArea("");setPage(1);}}>すべて</button>{areas.map(a=><button key={a} aria-pressed={area===a} onClick={()=>{setArea(area===a?"":a);setPage(1);}}>{a}</button>)}</div>
        <p className="filter-note">{copy.filterNote}</p>
        <a className="buddy-network-link" href="/buddy-network">{locale === "ja" ? "Buddyの紹介・招待" : locale === "en" ? "Buddy introductions & invites" : "同伴推荐与邀请"}</a>
        <div className="directory-extras">
          <button type="button" className="compare-add bookmark-button" aria-pressed={savedOnly} onClick={() => { setSavedOnly(!savedOnly); setPage(1); }}>
            {extras.saved} ({savedIds.length})
          </button>
        </div>
        <div className="result-toolbar" id="buddy-search-results" tabIndex={-1}><strong role="status" aria-live="polite">{(selectedWalkIdea || category) && ((selectedWalkIdea?.label[locale] ?? category) + " · ")}{results.length}{copy.results}</strong><button onClick={resetFilters}>{copy.clear}</button><label>{copy.sort} <select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="registered">{copy.registered}</option><option value="new">{copy.newest}</option><option value="price">{copy.priceSort}</option></select></label></div>
        {activeFilters.length > 0 && <ul className="active-search-filters">
          {activeFilters.map(filter => <li key={filter.label}>
            <button type="button" onClick={() => removeSearchFilter(filter.clear)}
              aria-label={`${browse.removeFilter} · ${filter.label} · ${filter.value}`}>
              <span>{filter.label} · {filter.value}</span><span aria-hidden="true">×</span>
            </button>
          </li>)}
        </ul>}
        {results.length === 0 ? <div className="empty-results">
          <h3>{locale === "ja" ? "条件に合うバディがまだいません" : locale === "en" ? "No buddies match these filters yet" : "暂时没有符合条件的同伴"}</h3>
          <p>{savedOnly && !savedIds.length ? extras.empty : alternatives.length ? browse.broaden : browse.noAlternative}</p>
          {alternatives.length > 0 && <div className="search-alternatives">
            {alternatives.map(option => <button key={option.label} type="button" onClick={() => removeSearchFilter(option.clear)}>
              {browse.removeFilter} · {option.label}
              <span>{option.count}{copy.results}</span>
            </button>)}
          </div>}
          <div className="empty-result-actions">
            <button type="button" onClick={() => { resetFilters(); focusBuddyResults(); }}>{browse.viewAll}</button>
          </div>
          {lineFinderCard}
        </div> : <div className="directory-grid">{pageResults.map((p, index) => <Fragment key={p.id}><article className="directory-card photo-card" id={`directory-card-${p.id}`}>
          <div className={`directory-image photo-cover ${p.kind}`}>{p.kind === "mari" ? <MariCollage/> : p.kind === "ted" ? <TedPortrait/> : p.kind === "ucci" ? <UcciPortrait/> : <img src={p.image} alt={`${p.name}のプロフィール写真`} loading="eager" onError={event=>{event.currentTarget.style.display="none";event.currentTarget.parentElement?.classList.add("image-missing");}} />}<CoverBadges profile={p} /></div>
          <div className="directory-card-heading">
            <h3>{p.name}</h3>
            <p className="directory-role" lang="ja">{p.description}</p>
            <small className="directory-area">{p.areas.join(" / ") || walkCopy.missingArea}</small>
            <p className="buddy-fee-label">{buddyTerms[locale].fee}</p>
            <div className="directory-price">
              <small>{extras.halfHour} <span aria-hidden="true">·</span></small>
              {yenAmount(p.fee / 2)}
              <span className="directory-converted-prices">{convertedPrices(p.fee / 2)}</span>
              <span className="directory-minimum-duration">{minimumFeeLabel(p.fee)}</span>
            </div>
            {englishSpeakingBuddies.has(p.id) && <p className="directory-spoken-language">{walkCopy.english}</p>}
          </div>
          <div className="directory-body">
            {(walkStories[p.id]?.[locale] || walkExamples[p.id]) && <p className="buddy-walk-example">
              <strong>{walkCopy.storyLabel}</strong>{" "}
              {walkStories[p.id]?.[locale]?.activity ?? <span lang="ja">{walkExamples[p.id]}</span>}
            </p>}
            <GenreLabels ids={p.categories} />
            {p.tags.length > 0 && <div className="buddy-passions">
              <p>{buddyTerms[locale].passion}</p>
              <div className="directory-tags">{p.tags.slice(0, 3).map(t => <button key={t} onClick={() => { setQuery(t); setPage(1); }}>#{t}</button>)}</div>
              {p.tags.length > 3 && <details className="directory-interests">
                <summary>{buddyTerms[locale].more}</summary>
                <div className="directory-tags">{p.tags.slice(3).map(t => <button key={t} onClick={() => { setQuery(t); setPage(1); }}>#{t}</button>)}</div>
              </details>}
            </div>}
            {(instagramAccounts[p.id] || mediaFeatures[p.id]?.length || p.id === "mimic-takara") && <button type="button" className="media-availability" onClick={() => openDirectoryProfile(p.id, "media")}>
              {instagramAccounts[p.id] ? mediaFeatures[p.id]?.length ? walkCopy.social : walkCopy.instagram : walkCopy.media} →
            </button>}
            <button className="detail-button" onClick={() => openDirectoryProfile(p.id)}>{copy.profilePrice}</button>
            <div className="directory-card-actions">{comparisonButton(p.id)}{bookmarkButton(p.id)}</div>
          </div>
        </article>
          {index + 1 === Math.min(6, pageResults.length) && lineFinderCard}
        </Fragment>)}</div>}
        {results.length>12 && <nav className="pagination" aria-label="一覧のページ"><button disabled={page===1} onClick={()=>setPage(page-1)}>前へ</button><span>{page} / {Math.ceil(results.length/12)}</span><button disabled={page*12>=results.length} onClick={()=>setPage(page+1)}>次へ</button></nav>}
        
        </>}
        {detail && viewedProfile && <section className="directory-detail" id="profile-detail" tabIndex={-1} aria-label="選択したプロフィール"><button type="button" className="back-results" onClick={backToDirectory}>{copy.back}</button>
{detail === "tapi-style" && (        <article className="profile-card">
          <a className="profile-thumbnail tapi-thumbnail" href="https://www.instagram.com/tapi.style/" target="_blank" rel="noopener noreferrer" aria-label="tapi.styleのInstagramを見る">
            <span className="profile-number">BUDDY No.001</span>
            <span className="tapi-avatar"><img src="/tapi-style-wide.jpeg" alt="TAPI STYLE — ファッションは自由だ！" /><CoverBadges profile={viewedProfile} /></span>
            <span className="profile-handle">@tapi.style ↗</span>
          </a>
          <div className="profile-copy">
            <span className="profile-label">個人プロフィール #001</span>
            <h3>tapi.style</h3><p className="profile-real-name">TAKAHIRO YANAGIDA</p>

            <p className="directory-area">高円寺 / 渋谷 / 原宿表参道 / 下北沢</p>
            <a className="instagram-link" href="https://www.instagram.com/tapi.style/" target="_blank" rel="noopener noreferrer">Instagram · @tapi.style ↗</a>
            <p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{["古着", "ヴィンテージ", "スーツ", "ドレス", "セレクトショップ"].map(tag => <span key={tag}>#{tag}</span>)}</div>
            {profilePrices(viewedProfile)}

            <p className="profile-note">対応日時は確認中です。現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p>
            <a className="profile-cta" href="https://www.instagram.com/tapi.style/" target="_blank" rel="noopener noreferrer">Instagramでスタイルを見る <span>↗</span></a>
          </div>
        </article>)}
{detail === "mimic-takara" && (        <article className="profile-card mimic-card">
          <a className="profile-thumbnail documentary-thumbnail" href={takaraVideo} target="_blank" rel="noopener noreferrer" aria-label="mimic宝さんの紹介動画をYouTubeで見る">
            <span className="profile-number">BUDDY No.002</span>
            <span className="documentary-frame"><img src="/mimic-documentary.jpeg" alt="フジテレビ ザ・ノンフィクション『ボクと古着と下北沢のその後』の動画サムネイル（提供画像）" /><CoverBadges profile={viewedProfile} /></span>
            <span className="documentary-caption"><small>フジテレビドキュメンタリー</small><strong>ボクと古着と下北沢のその後</strong><span>▶ YouTubeで動画を見る ↗</span></span>
          </a>
          <div className="profile-copy">
            <span className="profile-label">個人プロフィール #002</span>
            <h3>mimic宝</h3>
            <p className="profile-real-name">下北沢 × 古着屋店主</p>
            <p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{["下北沢", "ヴィンテージ", "古着屋", "レコード屋", "ノンフィクション", "古着屋店主"].map(tag => <span key={tag}>#{tag}</span>)}</div>
            {profilePrices(viewedProfile)}

            <p className="profile-note">対応日時は確認中です。現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p>
            <a className="profile-cta" href={takaraVideo} target="_blank" rel="noopener noreferrer">紹介動画を見る <span>↗</span></a>
          </div>
        </article>)}
{detail === "waki-masayuki" && (        <article className="profile-card waki-card">
          <div className="waki-thumbnail">
            <span className="profile-number">BUDDY No.003</span>
            <div className="badge-photo"><img className="waki-photo" src="/waki-bookshop.jpeg" alt="本棚に囲まれ、エプロンを着けた和氣正幸さん" /><CoverBadges profile={viewedProfile} /></div>
            <div className="waki-social">
              <span className="waki-social-label">X / TWITTER · @wakkyhr</span>
              <strong>14,384<span> フォロワー</span></strong>
              <small>提供画像の表示値 · 2026/10/16確認</small>
            </div>
          </div>
          <div className="profile-copy">
            <span className="profile-label">個人プロフィール #003</span>
            <h3>和氣正幸</h3>
            <p className="profile-real-name">本屋ライター ＆ 本屋店主</p>
            <p className="waki-intro">独立書店のこと、本のこと。<br />本屋を知る人と、街を歩こう。</p>
            <p className="profile-note">Xプロフィールで「日本一独立書店について詳しい本屋ライター」と紹介。シェア型書店＋新刊書店 BOOKSHOP TRAVELLERの店主。</p>
            <p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{["神保町", "古本", "古書", "文房具", "祖師ヶ谷大蔵"].map(tag => <span key={tag}>#{tag}</span>)}</div>
            {profilePrices(viewedProfile)}

            <p className="profile-note">対応日時は確認中です。現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p>
            <p className="waki-source">プロフィール情報・フォロワー数：ご提供のXプロフィール画像より</p>
          </div>
        </article>)}
{detail === "shibalife" && (        <article className="profile-card shiba-profile">
          <div className="shiba-profile-photo badge-photo"><img src="/shibata-kana-sauna.png" alt="柴田花菜さんの中目黒でサウナをつくる話" /><CoverBadges profile={viewedProfile} /></div>
          <div className="profile-copy">
            <span className="profile-label">個人プロフィール #004</span>
            <h3>柴田花菜（しばてぃん）</h3>
            <p className="profile-real-name">旅と宿とサウナづくり</p>
            <a className="instagram-link" href="https://www.instagram.com/shibalife.jp/" target="_blank" rel="noopener noreferrer">Instagram · @shibalife.jp ↗</a>
            <p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{["サウナ", "インテリア", "家具", "ゴルフ", "渋谷", "中目黒"].map(tag => <span key={tag}>#{tag}</span>)}</div>
            {profilePrices(viewedProfile)}

            <p className="profile-note">対応日時は確認中です。現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p>
            <a className="profile-cta" href="https://www.instagram.com/shibalife.jp/" target="_blank" rel="noopener noreferrer">Instagramでプロフィールを見る <span>↗</span></a>
          </div>
        </article>)}
{detail === "takashi-yokoishi" && (<article className="profile-card">
          <div className="profile-thumbnail yokoishi-thumbnail">
            <span className="profile-number">BUDDY PROFILE</span>
            <span className="yokoishi-avatar"><img src="/yokoishi-portrait.jpeg" alt="横石崇さんのプロフィール写真" /><CoverBadges profile={viewedProfile} /></span>
          </div>
          <div className="profile-copy">
            <h3>横石崇</h3><p className="profile-real-name">プロジェクトプロデューサー</p>

            <p className="directory-area">渋谷</p>
            <p>&amp;Co.代表取締役。「Tokyo Work Design Week」代表。鎌倉のコレクティブオフィス「北条SANCI」支配人。</p>
            <p>著書に『これからの僕らの働き方』（早川書房）、『自己紹介2.0』（KADOKAWA）。法政大学キャリアデザイン学部兼任講師。</p>
            <p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags"><span>#書店</span><span>#雑貨屋</span><span>#蔦屋書店</span><span>#工芸品</span><span>#プロダクト製品</span><span>#MOMA</span></div>
            {profilePrices(viewedProfile)}
          </div>
        </article>)}
{detail === "mayumi-asakura" && (<article className="profile-card mayumi-wide-profile">
          <a className="mayumi-wide-photo" href="https://www.instagram.com/mayumi_asakura/" target="_blank" rel="noopener noreferrer" aria-label="朝倉真弓さんのInstagramを見る"><img src="/mayumi-books-wide.jpeg" alt="朝倉真弓さんと著書の紹介" /><CoverBadges profile={viewedProfile} /></a>
          <div className="profile-copy">
            <h3>朝倉真弓</h3><p className="profile-real-name">ウォーキング講師、グレイヘアモデル</p>

            <p className="directory-area">二子玉川 / 横浜 / 渋谷 / 原宿表参道 / 新宿 / 銀座有楽町</p>
            <p>品格ウォーキング®主宰。ウォーキング講師、グレイヘアモデルとして活動。自著・共著9冊出版。</p>
            <a className="instagram-link" href="https://www.instagram.com/mayumi_asakura/" target="_blank" rel="noopener noreferrer">Instagram · @mayumi_asakura ↗</a>
            <p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags"><span>#ファッション</span><span>#化粧品</span></div>
            {profilePrices(viewedProfile)}
          </div>
        </article>)}
{detail === "mari-kumagai" && (<article className="profile-card">
          <a className="profile-thumbnail photo-detail mari-detail" href="https://www.instagram.com/marilovesbeauty.de/" target="_blank" rel="noopener noreferrer" aria-label="熊谷真理さんのInstagramを見る">
            <span className="profile-number">BUDDY No.005</span>
            <span className="mari-avatar"><MariCollage/><CoverBadges profile={viewedProfile} /></span>
            <span className="profile-handle">@marilovesbeauty.de ↗</span>
          </a>
          <div className="profile-copy">
            <span className="profile-label">個人プロフィール #005</span>
            <h3>熊谷真理</h3>
            <p className="profile-real-name">メイク講師 ＆ コスメコンシェルジュ</p>

            <p>スキンケア × メイク × インナーケア</p>
            <p className="directory-area">表参道 / 渋谷 / 新宿</p>
            <a className="instagram-link" href="https://www.instagram.com/marilovesbeauty.de/" target="_blank" rel="noopener noreferrer">Instagram · @marilovesbeauty.de ↗</a>
            <p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{["メイク","コスメ","起業家","メイク講師","コスメコンシェルジュ"].map(tag=><span key={tag}>#{tag}</span>)}</div>
            {profilePrices(viewedProfile)}

            <p className="profile-note">対応日時は確認中です。現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p>
            <p className="waki-source">プロフィール情報・フォロワー数：ご提供のInstagramプロフィール画像より</p>
            <a className="profile-cta" href="https://www.instagram.com/marilovesbeauty.de/" target="_blank" rel="noopener noreferrer">Instagramでプロフィールを見る <span>↗</span></a>
          </div>
        </article>)}
        {detail === "ucci" && profiles.filter(p=>p.id===detail).map(p=><article className="profile-card ucci-profile" key={p.id}>
          <div className="ucci-visual-column"><div className="ucci-cover"><UcciPortrait/><CoverBadges profile={p} /></div></div>
          <div className="profile-copy"><h3>{p.name}</h3><p>{p.description}</p><p className="profile-note">東京とニューヨークでのダンサー経験を経て、国内外の広告・イベントなどのキャスティングを手がけるプロデューサー。ブランド「TOKYOcreatist」の立ち上げや、NPO法人3F Community Serviceを通じたアーティスト支援にも取り組んできました。</p><p className="ucci-language">{walkCopy.language} · {walkCopy.english}</p><p className="directory-area">{p.areas.join(" / ")}</p><p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{p.tags.map(t=><span key={t}>#{t}</span>)}</div>{profilePrices(p)}<p className="profile-note">Instagramフォロワー：4.8万人（ご提供の数値）</p><p className="profile-note">現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p><a className="profile-cta" href="https://www.instagram.com/uccicreatist/" target="_blank" rel="noopener noreferrer">Instagramを見る ↗</a></div>
        </article>)}
        {detail === "ayano-tominaga" && profiles.filter(p=>p.id===detail).map(p=><article className="profile-card ayano-profile" key={p.id}>
          <div className="ayano-visual-column"><div className="ayano-profile-photo"><img src={p.image} alt="スマートフォンを手に、展示会で取材する富永あやのさん" /><CoverBadges profile={p} /></div></div>
          <div className="profile-copy"><h3>{p.name}</h3><p className="profile-real-name">富永彩乃 / Ayano Tominaga</p><p>{p.description}</p><p className="profile-note">海外の展示会やスマートフォンの発表会を取材。自撮り端末やスマホアクセサリー、動画撮影・ライブ配信など、身近なデジタルの楽しみ方を発信しています。</p><p className="directory-area">{p.areas.join(" / ")}</p><p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{p.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>{profilePrices(p)}<p className="profile-note">対応日時は確認中です。現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p><a className="profile-cta" href="https://ayanotominaga.com/" target="_blank" rel="noopener noreferrer">公式サイトを見る ↗</a></div>
        </article>)}
        {detail === "lua-soda" && profiles.filter(p=>p.id===detail).map(p=><article className="profile-card lua-profile" key={p.id}>
          <div className="lua-profile-photo badge-photo"><img src={p.image} alt="食材を前に調理するソウダルアさん" /><CoverBadges profile={p} /></div>
          <div className="profile-copy"><h3>{p.name}</h3><p className="profile-real-name">Lua Soda</p><p>{p.description}</p><p className="profile-note">日本各地を訪れ、その土地の食材と風土、歴史を料理で表現。和紙の上に料理を描くフードパフォーマンスや、地域の食文化に触れる活動を行っています。</p><p className="directory-area">{p.areas.join(" / ")}</p><p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{p.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>{profilePrices(p)}<p className="profile-note">対応日時は確認中です。現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p></div>
        </article>)}
        {detail === "coco" && profiles.filter(p=>p.id===detail).map(p=><article className="profile-card coco-profile" key={p.id}>
          <div className="coco-profile-photo badge-photo"><img src={p.image} alt="海辺でカメラを構えるCocoさん" /><CoverBadges profile={p} /></div>
          <div className="profile-copy"><h3>{p.name}</h3><p className="profile-real-name">{p.description}</p><p className="profile-note">旅先の人や環境とのつながりを大切にするフォトグラファー。フィリピン・バギオでの留学中には写真展も開催。写真を通じて、自身の活動や想いを伝えています。</p><p className="directory-area">{p.areas.join(" / ")}</p><p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{p.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>{profilePrices(p)}<p className="profile-note">対応日時は確認中です。現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p><a className="profile-cta" href="https://www.instagram.com/coco_7520/" target="_blank" rel="noopener noreferrer">Instagramを見る ↗</a></div>
        </article>)}
        {detail === "ikki-yokoji" && profiles.filter(p=>p.id===detail).map(p=><article className="profile-card ikki-profile" key={p.id}>
          <div className="ikki-profile-photo badge-photo"><img src={p.image} alt="自転車とともに街を楽しむ横路一樹さん" /><CoverBadges profile={p} /></div>
          <div className="profile-copy"><h3>{p.name}</h3><p>{p.description}</p><p className="profile-note">ファッションアテンダント創業者。ブランド古着の買取・販売、店舗運営、パーソナルスタイリストなどを経験。古着やリユースショップ、フリーマーケットでの宝探しから、自転車や雑貨まで、好きなものを見つける街歩きをご一緒します。</p><p className="directory-area">{p.areas.join(" / ")}</p><p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{p.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>{profilePrices(p)}<p className="profile-note">対応日時は確認中です。現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p><a className="profile-cta" href="https://www.instagram.com/ikkiyokoji/" target="_blank" rel="noopener noreferrer">Instagramを見る ↗</a></div>
        </article>)}
        {detail === "tetsuya-oi" && profiles.filter(p=>p.id===detail).map(p=><article className="profile-card ted-profile" key={p.id}>
          <div className="ted-visual-column"><div className="ted-cover"><TedPortrait/><CoverBadges profile={p} /></div></div>
          <div className="profile-copy"><h3>{p.name}</h3><p className="profile-real-name">TETSUYA OI / スポーツトレーナー</p><p>Instagram 1万人（ご提供画像の表示値）</p><p className="profile-note">HYROX official Performance Coach LV2。スポーツトレーナーとして30年、走りと歩きの指導33年の経験をプロフィールで紹介。公園での健康づくりや防災体力を推進する「ParkFit」にも取り組んでいます。</p><p className="directory-area">{p.areas.join(" / ")}</p><p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{p.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>{profilePrices(p)}<p className="profile-note">現在はプロフィール掲載のみで、予約・決済は受け付けていません。</p></div>
          <section className="buddy-reel"><h3>ショート動画で活動を見る</h3><iframe src="https://www.instagram.com/reel/Db9Vc-bzFcK/embed/" title="TedさんのInstagramショート動画" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /><p>表示されない場合は、Instagramで動画をご覧ください。</p><a className="profile-cta" href="https://www.instagram.com/reel/Db9Vc-bzFcK/" target="_blank" rel="noopener noreferrer">Instagramで動画を見る ↗</a></section>
        </article>)}
        {detail === "satoshi-miya" && profiles.filter(p => p.id === detail).map(p => (
          <article className="profile-card" key={p.id}>
            <div className="directory-image photo-cover"><img src={p.image} alt={p.name} /><CoverBadges profile={p} /></div>
            <div className="profile-copy">

              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p className="profile-note">ダンスユニットBROKEN SPORTで活動し、DJとしてヨガの練習に向けた音楽作品『with your PRACTICE』を制作。ダンスと音楽、ヨガを横断して活動しています。</p>
              <p className="directory-area">{p.areas.join(" / ")}</p>
              <p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{p.tags.map(tag => <span key={tag}>#{tag}</span>)}</div>
              {profilePrices(p)}
              <a className="profile-cta" href="https://www.instagram.com/satoshi_miya_/" target="_blank" rel="noopener noreferrer">Instagramを見る ↗</a>
            </div>
          </article>
        ))}
        {detail === "takashi-onizawa" && profiles.filter(p => p.id === detail).map(p => (
          <article className="profile-card ucci-profile" key={p.id}>
            <div className="ucci-visual-column">
              <div className="ucci-cover">
                <img className="ucci-portrait" src={p.image} alt={p.name} />
                <CoverBadges profile={p} />
              </div>

            </div>
            <div className="profile-copy">

              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{p.tags.map(tag => <span key={tag}>#{tag}</span>)}</div>
              {profilePrices(p)}
            </div>
          </article>
        ))}
        {detail === "akiko-kobayashi" && profiles.filter(p => p.id === detail).map(p => (
          <article className="profile-card ucci-profile" key={p.id}>
            <div className="ucci-visual-column">
              <div className="directory-image photo-cover akiko"><img src={p.image} alt={`着物姿の${p.name}さん`} /><CoverBadges profile={p} /></div>

            </div>
            <div className="profile-copy">

              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p className="profile-note">京都府出身。ドラマ『SHOGUN 将軍』に侍女・勢津役で出演し、女性の所作指導も担当。着付け動画などを通じて、着物や京都の文化を発信しています。</p>
              <p className="ucci-language">{walkCopy.language} · {walkCopy.english}</p>
              <p className="directory-area">{p.areas.join(" / ")}</p>
              <p className="buddy-fee-label">{buddyTerms[locale].passion}</p><div className="profile-tags">{p.tags.map(tag => <span key={tag}>#{tag}</span>)}</div>
              {profilePrices(p)}
            </div>
          </article>
        ))}
        {attendantProfiles[viewedProfile.id] && <article className="profile-card">
          <div className={`directory-image photo-cover ${viewedProfile.kind}`}>
            <img src={viewedProfile.image} alt={viewedProfile.name} />
            <CoverBadges profile={viewedProfile} />
          </div>
          <div className="profile-copy">
            <h3>{viewedProfile.name}</h3>
            <p>{viewedProfile.description}</p>
            <p className="profile-note">{attendantProfiles[viewedProfile.id].bio}</p>
            {attendantProfiles[viewedProfile.id].languages && <p className="ucci-language">{attendantProfiles[viewedProfile.id].languages}</p>}
            <p className="directory-area">{viewedProfile.areas.join(" / ")}</p>
            <p className="buddy-fee-label">{buddyTerms[locale].passion}</p>
            <div className="profile-tags">{viewedProfile.tags.map(tag => <span key={tag}>#{tag}</span>)}</div>
            {profilePrices(viewedProfile)}
            {attendantProfiles[viewedProfile.id].instagram && <a className="instagram-link" href={`https://www.instagram.com/${attendantProfiles[viewedProfile.id].instagram}/`} target="_blank" rel="noopener noreferrer">Instagram · @{attendantProfiles[viewedProfile.id].instagram} ↗</a>}
          </div>
        </article>}
        <BuddySocialConnections buddyId={viewedProfile.id} locale={locale} instagramAccount={mediaAccount} />
        {viewedProfile && <div className="profile-walk-details">
          <GenreLabels ids={viewedProfile.categories} />
          {walkStory && <section className="walk-story" aria-labelledby="walk-story-title">
            <h3 id="walk-story-title">{walkCopy.title}</h3>
            <p>{walkStory.area} · {walkCopy.example}</p>
            <dl>
              <div><dt>{walkCopy.activity}</dt><dd>{walkStory.activity}</dd></div>
              <div><dt>{walkCopy.forWhom}</dt><dd>{walkStory.forWhom}</dd></div>
            </dl>
          </section>}
          {profileArea && <a className="buddy-finder-link profile-finder-link" href={buddySearchRequestHref(profileArea, undefined, locale)}>{walkCopy.ask} →</a>}
        </div>}
        {viewedProfile && <div className="profile-compare-action">
          {comparisonButton(viewedProfile.id)}
          {bookmarkButton(viewedProfile.id)}
          {comparisonProfileId === viewedProfile.id && compareIds.length > 0 && (
            <button type="button" className="compare-add" onClick={() => compareDialog.current?.showModal()}>
              {comparison.back} · {compareIds.length} / 3
            </button>
          )}
        </div>}
        {viewedProfile && <BudgetAlternatives key={viewedProfile.id + area}
          profile={viewedProfile} area={area} locale={locale} onSelect={openProfile} />}
        {relatedBuddies.length > 0 && <section className="related-buddies" aria-labelledby="related-buddies-title">
          <h3 id="related-buddies-title">{browse.nearbyBuddies}</h3>
          <div className="related-buddies-grid">
            {relatedBuddies.map(candidate => <button type="button" className="related-buddy" key={candidate.profile.id}
              onClick={() => openProfile(candidate.profile.id)}>
              <img src={candidate.profile.image} alt="" loading="lazy" width="52" height="52" />
              <span>
                <strong>{candidate.profile.name}</strong>
                <small>{candidate.area} · {categories.find(item => item.id === candidate.category)?.label}</small>
                <span className="compact-buddy-price"><small>{extras.halfHour}</small>{price(candidate.profile.fee / 2)}</span>
              </span>
              <span aria-hidden="true">→</span>
            </button>)}
          </div>
        </section>}
        <BuddyIntroductions key={`buddy-introductions-${detail}`} profileId={detail} locale={locale} openProfile={openProfile} />
        <UserVoice key={`user-voice-${detail}`} buddyId={detail} locale={locale} />
        <ProfileWindows key={detail} buddyId={detail} />
        {(mediaAccount || mediaFeatures[detail]?.length || detail === "mimic-takara") && <section className="media-features" id="profile-media" tabIndex={-1} aria-labelledby="profile-media-title">
          {profileView?.section === "media" && <button type="button" className="back-results" onClick={backToDirectory}>{copy.back}</button>}
          <div className="media-section-heading"><h3 id="profile-media-title">{walkCopy.section}</h3></div>
          {mediaAccount && <InstagramPreview key={mediaAccount} account={mediaAccount} />}
          {detail === "mimic-takara" && <a className="profile-cta" href={takaraVideo} target="_blank" rel="noopener noreferrer">
            {{ ja: "紹介動画を見る", en: "Watch Takara’s profile video", zh: "观看宝的介绍视频" }[locale]} ↗
          </a>}
          {mediaFeatures[detail]?.length > 0 && <div className="media-feature-grid" lang="ja">
            {mediaFeatures[detail].map(item => <a className="media-feature" href={item.url} target="_blank" rel="noopener noreferrer" key={item.url}>
              <div className="media-feature-image"><span aria-hidden="true">INTERVIEW</span>{item.image && <img src={item.image} alt={`${item.publisher}の取材記事掲載写真`} loading="lazy" referrerPolicy="no-referrer" onError={event => { event.currentTarget.style.display = "none"; }} />}</div>
              <div className="media-feature-copy"><small>{item.publisher}{item.date && ` · ${item.date}`}</small><span className="media-kind">{item.kind}</span><h4>{item.title}</h4><span>掲載ページを見る ↗</span></div>
            </a>)}
          </div>}
        </section>}
        </section>}
      </section>

      {publicRequest && <section className="request-options walk-resume" aria-label="進行中の街歩きデモ">
        <div><p className="request-step">進行中の街歩き · デモ</p><h2>{publicRequest.area} · {publicRequest.duration}</h2><p>{publicRequest.title}</p></div>
        <button type="button" className="request-apply" onClick={() => focusRequestSection(resumeWalk[1])}>{resumeWalk[0]} →</button>
      </section>}

      <section className="public-board" id="public-board" aria-labelledby="public-board-title">
        <div className="public-board-heading"><div><p className="eyebrow">OPEN CALL / FIND A COMPANION</p><h2 id="public-board-title" tabIndex={-1}>同行してほしいBuddyを募る</h2><p>こちらはリスペクトフィーを支払って同行を依頼する利用者さん向けの募集です。行きたい街と希望を公開し、応募したBuddyから1人を選びます。</p></div><span className="public-board-stamp">公開募集<br/>BETA</span></div>
        {!publicRequest ? <div className="request-compose">
          <div className="request-compose-copy"><span className="request-step">01 / 利用者として募集する</span><h3>どの街を、どんな人と歩きたいですか？</h3><p>街と日時を入力して、Buddyを募る流れを体験できます。このデモでは募集内容の公開や支払いは発生しません。</p><p>実際の利用では、応募したBuddyのプロフィールと同行料金を確認して1人を選びます。具体的な待ち合わせ場所はマッチ後に共有します。</p></div>
          {requestReview ? <section className="request-review" aria-labelledby="request-review-title">
            <p className="request-step">公開前の確認</p>
            <h3 id="request-review-title" tabIndex={-1}>募集内容を確認する</h3>
            <dl>
              <div><dt>Buddyにお願いしたいこと</dt><dd>{requestReview.title}</dd></div>
              <div><dt>エリア</dt><dd>{requestReview.area}</dd></div>
              <div><dt>{requestTimeLabel}</dt><dd>{requestReview.when}</dd></div>
              <div><dt>所要時間</dt><dd>{requestReview.duration}</dd></div>
              <div><dt>{requestDeadlineLabel}</dt><dd>{requestReview.deadline}</dd></div>
            </dl>
            <p className="request-review-note">実際の募集では、依頼者プロフィールと上記の募集内容が公開されます。詳しい待ち合わせ場所はマッチ後のチャットで共有します。</p>
            <button className="request-publish" type="button" onClick={() => {
              const id = crypto.randomUUID();
              const entrySource = currentVintageSource();
              setPublicRequest({ ...requestReview, id, applicants: [], selected: null, owner: "あなた", entrySource });
              recordDemo(id, "posted", entrySource);
              setRequestReview(null);
              focusRequestSection("request-live-title");
            }}>デモで募集を表示する <span aria-hidden="true">→</span></button>
            <button className="request-edit" type="button" onClick={() => {
              setRequestReview(null);
              focusRequestSection("request-title");
            }}>入力内容を修正する</button>
          </section> : <form className="request-form" onSubmit={reviewRequest} noValidate>
            {requestSearchNote && <p className="request-search-note" role="status">{requestSearchNote}</p>}
            <p className="request-draft-note">入力内容はこのタブに下書きとして残ります。</p>
            <div className="request-examples">
              <strong>希望を選んで下書きする</strong>
              {requestTitle.trim() ? <small>入力した文章は下で編集できます。</small> : <div>
                {[...requestPreferences, ...requestExamples].map(example => <button key={example.label} type="button" onClick={() => {
                  setRequestTitle(example.title);
                  clearRequestError("request-title");
                  focusRequestSection("request-title");
                }}>{example.label}</button>)}
              </div>}
            </div>
            <div>
              <label>Buddyにお願いしたいこと<input id="request-title" value={requestTitle}
                onChange={event => { setRequestTitle(event.target.value); clearRequestError("request-title"); }}
                placeholder="例：下北沢の古着屋巡りに、詳しいBuddyに付き合ってほしい" maxLength={70}
                required {...titleFeedback.props} /></label>
              {titleFeedback.message}
            </div>
            <div className="request-form-row">
              <div>
                <label>エリア<select id="request-area" value={requestArea}
                  onChange={event => { setRequestArea(event.target.value); clearRequestError("request-area"); }}
                  required {...areaFeedback.props}>
                  <option value="" disabled>エリアを選ぶ</option>
                  {launchAreas.map(place => <option key={place}>{place}</option>)}
                </select></label>
                {areaFeedback.message}
              </div>
              <label>{requestTimeLabel}<select id="request-when" value={requestWhen}
                onChange={event => { setRequestWhen(event.target.value); clearRequestError("request-datetime"); }}>
                <option>今すぐ</option><option>今日の午後</option><option>日時を指定</option>
              </select></label>
            </div>
            <details className="inline-help"><summary>日時はいつ確定する？</summary><p>ここで入力するのは希望日時です。マッチ成立後、Buddyと相談して待ち合わせを確定します。</p></details>
            {requestWhen === "日時を指定" && <div>
              <label>日付と時刻<input id="request-datetime" type="datetime-local" required value={requestDateTime}
                onChange={event => { setRequestDateTime(event.target.value); clearRequestError("request-datetime"); }}
                {...dateFeedback.props} /></label>
              {dateFeedback.message}
            </div>}
            <div className="request-form-row">
              <label>所要時間<select value={requestDuration} onChange={event => setRequestDuration(event.target.value)}>
                {Object.keys(requestMinutes).map(duration => <option key={duration}>{duration}</option>)}
              </select></label>
              <label>{requestDeadlineLabel}<select value={requestDeadline} onChange={event => setRequestDeadline(event.target.value)}>
                <option>1時間</option><option>6時間</option><option>24時間</option><option>48時間</option>
              </select></label>
            </div>
            <button className="request-publish" type="submit">募集内容を確認する <span aria-hidden="true">→</span></button>
            <button className="request-edit" type="button" onClick={clearRequestDraft}>下書きを消す</button>
          </form>}
        </div> : <div className="request-live">
          <div className="request-live-main"><span className={`request-status ${publicRequest.selected ? "is-selected" : ""}`}>{publicRequest.selected ? "Buddy決定" : "応募受付中"}</span><h3 id="request-live-title" tabIndex={-1}>{publicRequest.title}</h3><div className="request-owner-profile"><span className="request-owner-avatar">IK</span><span><strong>利用者（依頼者）のプロフィール</strong><small>表示名・プロフィールを応募前に確認できます</small></span></div><div className="request-meta"><span>📍 {publicRequest.area}</span><span>◷ {publicRequest.when} · {publicRequest.duration}</span><span>締切 {publicRequest.deadline}</span></div><p className="location-privacy-note">具体的な待ち合わせ場所は、マッチ成立後にチャットで共有します。</p><p>{publicRequest.selected ? `${publicRequest.selected}さんに決まりました。街歩きの条件を確認しましょう。` : `応募 ${publicRequest.applicants.length}人 · 締切まで応募を受け付けます。`}</p>
            {!publicRequest.selected && <div className="request-actions">
              <button className="request-apply" type="button" disabled={publicRequest.applicants.length > 0} onClick={() => {
                const sample = profiles.find(profile => profile.areas.some(place => place === publicRequest.area || requestAreaAliases[place] === publicRequest.area));
                setPublicRequest({ ...publicRequest, applicants: [sample ? `${sample.name}（応募デモ）` : "サンプルBuddy"] });
                recordDemo(publicRequest.id, "applied", publicRequest.entrySource);
              }}>{publicRequest.applicants.length ? "応募サンプルを追加済み" : "デモ：Buddyからの応募を表示"}</button>
              {!publicRequest.applicants.length && <button className="request-edit" type="button" onClick={() => {
                setPublicRequest(null);
                setRequestSearchNote("募集内容を引き継ぎました。時間を変更して、もう一度試せます。");
                focusRequestSection("request-when");
              }}>時間を変えて募集を試す</button>}
              <small>プロフィールを使った操作例です。本人に応募や通知は発生しません。</small>
            </div>}
          </div>
          <div className="applicant-panel"><span className="request-step">02 / プロフィール・リスペクトフィーを確認して選ぶ</span><h4 id="request-applicants" tabIndex={-1}>応募したBuddy <b>{publicRequest.applicants.length}</b></h4>{publicRequest.applicants.length ? <ul>{publicRequest.applicants.map(name=><li key={name}><span className="applicant-avatar">{name.startsWith("Buddy") ? "B" : name.slice(0,1)}</span><span><strong>{name}</strong><small>応募サンプル · {publicRequest.duration}のリスペクトフィーを確認</small></span>{publicRequest.selected ? <b className="chosen-label">{publicRequest.selected===name?"選択済み":"受付終了"}</b> : <button onClick={() => { setWalkStage("matched"); setPublicRequest({ ...publicRequest, selected: name }); recordDemo(publicRequest.id, "matched", publicRequest.entrySource); focusRequestSection("today-walk-title"); }}>この人を選ぶ</button>}</li>)}</ul> : <p className="no-applicants">応募が届くとここに表示されます。<br/>応募者のプロフィールとリスペクトフィーを確認して1人を選べます。</p>}</div>
          {publicRequest.selected && <TodayWalk key={publicRequest.id} buddy={selectedDemoProfile?.name ?? publicRequest.selected} suggestedFee={demoFee} area={publicRequest.area}
            when={publicRequest.when} duration={publicRequest.duration} stage={walkStage} setStage={setWalkStage}
            onMeet={() => recordDemo(publicRequest.id, "met", publicRequest.entrySource)} />}
          <button className="request-cancel" onClick={()=>{setPublicRequest(null);clearRequestDraft();}}>募集を終了して新しく作る</button>
        </div>}
        <p className="public-board-footnote">※ この画面は機能イメージのプレビューです。募集・応募・決済はまだ実際には送信されません。</p>
      </section>

      <footer className="buddy-entry-footer">
            <a className="hero-buddy-application" href="https://shopping-buddy-recruitment.ikkiyokoji.chatgpt.site/" hrefLang="ja">
              {{ ja: "Buddyとして参加する", en: "Apply to become a Buddy", zh: "申请成为同行伙伴" }[locale]}
              <span aria-hidden="true">↗</span>
            </a>
      </footer>
      <span className="sr-only" role="status">{compareProfiles.length > 0 ? `${comparison.title} · ${compareProfiles.length} / 3 · ${compareProfiles.map(profile => profile.name).join(" · ")}` : ""}</span>
      {compareProfiles.length > 0 && <div className="comparison-dock">
        <button ref={compareDockButton} type="button" onClick={() => compareDialog.current?.showModal()}>
          <span className="comparison-dock-label">{comparison.compare} · {compareProfiles.length} / 3</span>
          <span className="comparison-dock-names">{compareProfiles.map(profile => profile.name).join(" · ")}</span>
        </button>
      </div>}
      <dialog ref={compareDialog} className="buddy-comparison" aria-labelledby="buddy-comparison-title">
        <header>
          <h2 id="buddy-comparison-title">{comparison.title}</h2>
          <form method="dialog"><button type="submit">{comparison.close}</button></form>
        </header>
        {compareProfiles.length === 0 ? <p>{comparison.empty}</p> : <>
          <section className="comparison-summary" aria-labelledby="comparison-summary-title">
            <h3 id="comparison-summary-title">{comparison.summary}</h3>
            <p>{comparison.hint}</p>
            <ul>
              {compareProfiles.map(profile => (
                <li key={profile.id}>
                  <button type="button" aria-pressed={currentComparisonId === profile.id}
                    aria-controls={`compare-card-${profile.id}`}
                    onClick={() => setActiveComparisonId(profile.id)}>
                    <span>{profile.name}</span>
                    <span className="comparison-summary-price"><small>{extras.halfHour}</small>{yenAmount(profile.fee / 2)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <div className="comparison-grid">
            {compareProfiles.map(profile => (
              <article key={profile.id} id={`compare-card-${profile.id}`} data-current={currentComparisonId === profile.id}>
                <h3>{profile.name}</h3>
                <p>{profile.areas.join(" / ") || "—"}</p>
                <GenreLabels ids={profile.categories} />
                <dl>
                  <dt>{buddyTerms[locale].fee} · {extras.halfHour}</dt>
                  <dd className="comparison-price">
                    {price(profile.fee / 2)}
                    <small className="directory-minimum-duration">{minimumFeeLabel(profile.fee)}</small>
                  </dd>
                  <dt>{buddyTerms[locale].passion}</dt>
                  <dd>{profile.tags.join(" / ")}</dd>
                  {locale === "ja" && walkStyles[profile.id] && <>
                    <dt>案内スタイルの例</dt><dd>{walkStyles[profile.id]}</dd>
                  </>}
                  {locale === "ja" && walkExamples[profile.id] && <>
                    <dt>街歩き例</dt>
                    <dd>{walkExamples[profile.id]}</dd>
                  </>}
                  <dt>{comparison.media}</dt>
                  <dd>{mediaFeatures[profile.id]?.map(item => item.publisher).join(" / ")
                    || (profile.id === "mimic-takara" ? "紹介動画あり" : "—")}</dd>
                </dl>
                <button type="button" onClick={() => {
                  setActiveComparisonId(profile.id);
                  setComparisonProfileId(profile.id);
                  compareDialog.current?.close();
                  openProfile(profile.id);
                }}>{copy.profilePrice}</button>
                <BudgetAlternatives key={area} profile={profile} area={area} locale={locale}
                  onSelect={(id) => { setComparisonProfileId(id); compareDialog.current?.close(); openProfile(id); }} />
                <button type="button" aria-label={`${comparison.remove} · ${profile.name}`}
                  onClick={() => setCompareIds(current => current.filter(id => id !== profile.id))}>{comparison.remove}</button>
              </article>
            ))}
          </div>
        </>}
      </dialog>

      <PocWeeklySummary events={demoEvents} />


      {buddy && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setActiveBuddy(null)}>
          <section className="chat-modal" role="dialog" aria-modal="true" aria-label={`${buddy.name}さんとのチャット`} onMouseDown={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setActiveBuddy(null)} aria-label="閉じる">×</button>
            <div className="modal-person"><div className="portrait" style={{ background: buddy.color }}>{buddy.emoji}</div><div><small>マッチしました！</small><h2>{buddy.name}さんと歩く</h2><p>待ち合わせ：下北沢駅 東口前・{buddy.time}</p></div></div>
            <div className="message-list">{messages.map((item, index) => <p key={index} className={index ? "mine" : "theirs"}>{item}</p>)}</div>
            <div className="message-form"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} placeholder="メッセージを入力" aria-label="メッセージ" /><button onClick={sendMessage}>送信</button></div>
            <button className="meetup-confirm">📍 下北沢駅 東口前で待ち合わせを確定</button>
          </section>
        </div>
      )}
    </main>
  );
}
