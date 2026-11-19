import { matchesDestinationArea } from "./travel-destinations";
import { matchesBuddyAge, occupationsByBuddy } from "./buddy-discovery-filters";

// Profile fees are stored as the tax-exclusive rate for 60 minutes.
export const minimumRespectFeeBeforeTax = 9_000;
export const respectFeeWithTax = (feeBeforeTax: number) => Math.round(feeBeforeTax * 1.1);
export const minimumRespectFee = respectFeeWithTax(minimumRespectFeeBeforeTax);

export const categories = [
 {id:"衣",label:"ファッション",description:"古着・洋服・靴・小物",icon:"♧",color:"#ac553f"},
 {id:"美",label:"ビューティー",description:"コスメ・メイク・美容",icon:"✧",color:"#a94e79"},
 {id:"食",label:"フード",description:"食材・グルメ・手土産",icon:"♨",color:"#a86626"},
 {id:"住",label:"インテリア",description:"家具・雑貨・暮らし",icon:"⌂",color:"#42775d"},
 {id:"遊",label:"カルチャー",description:"本・音楽・趣味・サウナ",icon:"♫",color:"#366c9a"},
 {id:"電",label:"ガジェット",description:"家電・カメラ・デジタル",icon:"ϟ",color:"#7258a0"},
 {id:"和",label:"和文化",description:"着物・和雑貨・伝統工芸",icon:"◇",color:"#8b513d"},
 {id:"古",label:"ヴィンテージ",description:"古着・古道具・骨董",icon:"◈",color:"#71583d"}
];
export const areas = ["京都","代官山中目黒", "丸の内日比谷", "博多天神", "沖縄", "カンボジア", "豊洲", "築地", "足立市場", "秋葉原", "銀座", "二子玉川", "横浜", "銀座有楽町", "高円寺", "原宿表参道", "表参道", "新宿", "渋谷", "下北沢", "浅草", "梅田", "福岡天神", "名古屋栄", "京都河原町", "中目黒", "神保町", "祖師ヶ谷大蔵"];
export const profiles = [
 {id:"akiko-kobayashi",categories:["和","古","衣"],name:"こばやしあきこ",description:"俳優",gender:"未設定",areas:["京都","銀座有楽町","渋谷"],tags:["着物","和装","リユース着物","俳優","英語対応可能"],fee:15000,image:"/akiko-kobayashi-kimono.jpeg",kind:"akiko",coverBadges:["『SHOGUN 将軍』出演・所作指導", "俳優・着物文化の発信"] as const},
 {id:"takashi-onizawa",categories:["住","衣","遊"],name:"鬼澤孝史",description:"インテリアコーディネーター",gender:"未設定",areas:[],tags:["インテリア","家具","バイク","クロムハーツ"],fee:30000,image:"/onizawa-portrait.jpeg",kind:"onizawa",coverBadges:["Instagram 1万人", "インテリアコーディネーター"] as const},
 {id:"satoshi-miya",categories:["遊","衣"],name:"宮 聡（Satoshi Miya）",description:"DJ・ダンサー／ヨガイベントプロデューサー",gender:"未設定",areas:["渋谷","代官山中目黒"],tags:["ダンス","DJ","レコード","ヨガ","アスレジャー"],fee:11000,image:"/miya-satoshi.jpg",kind:"miya",coverBadges:["ヨガと音楽をつなぐDJ", "ダンサー・ヨガイベント企画"] as const},
 {"id": "ucci", "categories": ["衣", "遊"], "name": "内田洋茂（ウッチー）", "description": "キャスティングプロデューサー / Digress-Lab LLC CEO", "gender": "未設定", "areas": ["渋谷", "原宿表参道"], "tags": ["裏原宿", "ストリートブランド", "レコード屋", "ダンサー", "HIPHOP", "アウトドア"], "fee": 50000, "image": "/ucci-seaside-wide.png", "kind": "ucci", coverBadges:["Instagram 4.8万人", "キャスティングプロデューサー"] as const},
 {"id": "tetsuya-oi", "categories": ["遊", "衣"], "name": "大井てつや（Ted）", "description": "スポーツトレーナー", "gender": "未設定", "areas": ["新宿", "渋谷", "銀座有楽町"], "tags": ["HYROX", "トレーニング", "ランニング", "ウォーキング", "整体", "公園フィットネス", "防災体力"], "fee": 13000, "image": "/ted-outdoor-profile.jpeg", "kind": "ted", coverBadges:["Instagram 1万人", "スポーツトレーナー"] as const},
 {"id": "ikki-yokoji", "categories": ["衣", "住", "遊"], "name": "ヨコジ / 横路一樹", "description": "shopping×tech起業家", "gender": "未設定", "areas": ["渋谷", "原宿表参道", "下北沢", "新宿", "代官山中目黒", "丸の内日比谷", "銀座有楽町", "横浜"], "tags": ["ブランド古着", "ファミリーセール", "リサイクルショップ", "フリーマーケット会場", "自転車", "セレクトショップ", "雑貨屋"], "fee": minimumRespectFeeBeforeTax, "image": "/ikki-yokoji.jpg", "kind": "ikki", coverBadges:["ファッションアテンダント創業者", "shopping×tech起業家"] as const},
 {"id": "coco", "categories": ["遊"], "name": "Coco", "description": "世界を旅するフォトグラファー", "gender": "未設定", "areas": ["博多天神", "下北沢", "沖縄", "カンボジア"], "tags": ["写真", "フォトグラファー", "写真展", "旅", "海外旅行", "留学"], "fee": minimumRespectFeeBeforeTax, "image": "/coco-camera-profile.png", "kind": "coco", coverBadges:["旅先での出会いと、写真のある時間", "世界を旅するフォトグラファー"] as const},
 {"id": "lua-soda", "categories": ["食"], "name": "ソウダルア", "description": "出張料理人・現代美食家", "gender": "未設定", "areas": ["豊洲", "築地", "足立市場"], "tags": ["出張料理", "旬の食材", "スパイス", "食文化", "フードアート", "地産地消"], "fee": 20000, "image": "/lua-soda.jpg", "kind": "lua", coverBadges:["土地の食材と物語を、料理でつなぐ", "出張料理人・現代美食家"] as const},
 {"id": "ayano-tominaga", "categories": ["電"], "name": "富永あやの", "description": "ITジャーナリスト・自撮り端末研究家", "gender": "未設定", "areas": ["渋谷", "秋葉原", "銀座"], "tags": ["スマートフォン", "iPhone", "Galaxy", "自撮り", "動画撮影", "スマホアクセサリー", "スキャナー", "デジタル活用"], "fee": 38000, "image": "/ayano-tominaga.jpg", "kind": "ayano", coverBadges:["X 11,658人", "Instagram 1万人"] as const},
 {id:"tapi-style",categories:["衣"],name:"tapi.style",description:"TAKAHIRO YANAGIDA",gender:"未設定",areas:["高円寺","渋谷","原宿表参道","下北沢"],tags:["古着","ヴィンテージ","スーツ","ドレス","セレクトショップ"],fee:30000,image:"/tapi-style-wide.jpeg",kind:"tapi",coverBadges:["Instagram 7.3万人", "ファッションは自由だ！"] as const},
 {id:"mimic-takara",categories:["衣","遊"],name:"mimic宝",description:"下北沢 × 古着屋店主",gender:"未設定",areas:["下北沢"],tags:["ヴィンテージ","古着屋","レコード屋","ノンフィクション","古着屋店主"],fee:30000,image:"/mimic-documentary.jpeg",kind:"mimic",coverBadges:["下北沢の古着屋店主", "フジTVノンフィクション出演"] as const},
 {id:"waki-masayuki",categories:["遊"],name:"和氣正幸",description:"本屋ライター ＆ 本屋店主",gender:"未設定",areas:["神保町","祖師ヶ谷大蔵"],tags:["古本","古書","文房具"],fee:20000,image:"/waki-bookshop.jpeg",kind:"waki",coverBadges:["X 14,384人", "本屋ライター・書店店主"] as const},
 {id:"shibalife",categories:["住","遊"],name:"柴田花菜（しばてぃん）",description:"旅と宿とサウナづくり",gender:"未設定",areas:["渋谷","中目黒"],tags:["サウナ","インテリア","家具","ゴルフ"],fee:minimumRespectFeeBeforeTax,image:"/shibata-kana-sauna.png",kind:"shiba",coverBadges:["Instagram 6,669人", "旅と宿とサウナづくり"] as const},
 {id:"mari-kumagai",categories:["美"],name:"熊谷真理",description:"メイク講師 ＆ コスメコンシェルジュ",gender:"未設定",areas:["表参道","渋谷","新宿"],tags:["メイク","コスメ","起業家","メイク講師","コスメコンシェルジュ"],fee:20000,image:"/mari-card-portrait.jpg",kind:"mari",coverBadges:["Instagram 7,252人", "メイク講師・コスメコンシェルジュ"] as const},
 {id:"takashi-yokoishi",categories:["遊"],name:"横石崇",description:"プロジェクトプロデューサー",gender:"未設定",areas:["渋谷"],tags:["書店","雑貨屋","蔦屋書店","工芸品","プロダクト製品","MOMA"],fee:20000,image:"/yokoishi-portrait.jpeg",kind:"yokoishi",coverBadges:["『自己紹介2.0』 著者", "プロジェクトプロデューサー"] as const},
 {id:"mayumi-asakura",categories:["美","衣"],name:"朝倉真弓",description:"ウォーキング講師、グレイヘアモデル",gender:"未設定",areas:["二子玉川","横浜","渋谷","原宿表参道","新宿","銀座有楽町"],tags:["ファッション","化粧品"],fee:11000,image:"/mayumi-books-wide.jpeg",kind:"mayumi",coverBadges:["自著・共著9冊出版", "ウォーキング講師・グレイヘアモデル"] as const}
];
export type BuddyProfile = (typeof profiles)[number];

function normalizeSearch(value: string) {
  return value.normalize("NFKC").toLowerCase()
    .replace(/シモキタ|しもきた|shimokitazawa/g, "下北沢")
    .replace(/ビンテージ|ヴィンテイジ|vintage/g, "ヴィンテージ")
    .replace(/こうえんじ|koenji/g, "高円寺")
    .replace(/じんぼうちょう|jinbocho|jim bocho|jimbocho/g, "神保町");
}

export function filterProfiles(query: string, area: string, gender: string, sort: string, category = "", age = "", occupation = "") {
  const words = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  const now = new Date();
  return profiles.filter(profile => {
    if (category && !profile.categories.includes(category)) return false;
    if (area && (area === "未設定" ? profile.areas.length > 0 : !matchesDestinationArea(profile.areas, area))) return false;
    if (gender && profile.gender !== gender) return false;
    if (age && !matchesBuddyAge(profile.id, age, now)) return false;
    if (occupation && !occupationsByBuddy[profile.id]?.some(role => role === occupation)) return false;
    const search = normalizeSearch([profile.name, profile.description, ...profile.tags, ...profile.areas].join(" "));
    return words.every(word => search.includes(word.replace(/^#/, "")));
  }).sort((a, b) => sort === "price"
    ? a.fee - b.fee
    : sort === "new" ? profiles.indexOf(b) - profiles.indexOf(a) : 0);
}

export function lowerPriceBuddies(source: BuddyProfile, area: string) {
  const sourceFee = source.fee;
  const sourceTags = new Set(source.tags.map(normalizeSearch));
  return profiles.flatMap(profile => {
    const fee = profile.fee;
    if (profile.id === source.id || fee >= sourceFee || (area && !matchesDestinationArea(profile.areas, area))) return [];
    const sharedTags = profile.tags.filter(tag => sourceTags.has(normalizeSearch(tag)));
    const sharesCategory = profile.categories.some(category => source.categories.includes(category));
    return [{ profile, fee, sharedTags, sharesCategory }];
  }).sort((a, b) => b.sharedTags.length - a.sharedTags.length || Number(b.sharesCategory) - Number(a.sharesCategory) || a.fee - b.fee)
    .slice(0, 3);
}

export const mediaFeatures: Record<string, {title:string;publisher:string;date?:string;kind:string;url:string;image:string}[]> = {
 "akiko-kobayashi": [
   {title:"京女優・こばやしあきこさんのステキな夏コーデ",publisher:"きもの屋ゆめこもん",date:"2016年7月8日",kind:"着物コーディネート",url:"https://yumecomon.com/2016/07/12994/",image:""},
   {title:"『SHOGUN 将軍』の世界観を支えた所作指導",publisher:"きものと／京都きもの市場",kind:"取材・インタビュー",url:"https://www.kimonoichiba.com/media/column/1361/",image:""},
   {title:"夢に手を挙げ続けて―京都から世界へ",publisher:"Vine Online／同志社女子大学",kind:"卒業生インタビュー",url:"https://www.vine-online.jp/article/line/17/",image:""},
   {title:"寄付講座「きもの学」｜着物の美と心を語る",publisher:"同志社女子大学",kind:"講座登壇のお知らせ",url:"https://www.dwc.doshisha.ac.jp/news/9812-shogunog",image:""},
 ],
 "takashi-onizawa": [
   {title:"インテリアコーディネーター 鬼澤孝史さん",publisher:"ケルヒャー",kind:"取材・インタビュー",url:"https://www.kaercher.com/jp/home-garden/karcher-magazine/lifestyle02.html",image:""},
   {title:"鬼澤 孝史",publisher:"HUMAN STORY",kind:"取材・インタビュー",url:"https://humanstory.jp/onizawa_takashi/",image:""},
 ],
 "satoshi-miya": [
   {title:"サーモマグのあるライフスタイル #thermomugpeople_16",publisher:"thermo mug",kind:"取材・インタビュー",url:"https://thermomug.com/blogs/feature/2019-0513",image:"/miya-satoshi.jpg"},
   {title:"ヨガプラクティスのための音楽。「with your PRACTICE」発売！DJ Satoshi Miyaインタビュー",publisher:"ヨガジェネレーション",kind:"取材・インタビュー",url:"https://media.yoga-gene.com/45047-2/",image:"/miya-yoga-interview.jpg"},
 ],
 "ucci": [{"title": "表現する立場から支える側に。アーティストコミュニティがくれた再始動のきっかけ", "publisher": "Peatix", "kind": "取材・インタビュー", "url": "https://feature.peatix.com/100-10_uchida", "image": "https://feature.peatix.com/wp-content/uploads/2020/03/10_uchida-face_001.jpg"}, {"title": "NPO法人「3F Community Service」理事長 内田洋茂さん", "publisher": "タウンニュース", "kind": "人物風土記", "date": "2016年7月22日", "url": "https://www.townnews.co.jp/0603/2016/07/22/341631.html", "image": ""}, {"title": "内田洋茂｜クリエイティスト・プロデューサー", "publisher": "NPO法人湘南スタイル", "kind": "会員プロフィール", "url": "https://www.shonan-style.jp/member/uchida/", "image": "https://www.shonan-style.jp/cms/wp-content/uploads/2017/09/18449443_10211520244675046_8934658470323030632_o.jpg"}, {"title": "内田洋茂｜Digress-Lab LLC 代表", "publisher": "The Focus", "kind": "取材・インタビュー", "url": "https://thefocus-on.com/uchida_hiroshige/", "image": "https://thefocus-on.com/wp/wp-content/uploads/2022/11/photo2.001-e1667978035163.jpeg"}],
 "tapi-style": [{"title": "国籍も色もミックスしながらオリジナルの着こなしを追求！", "publisher": "AdvancedTime／小学館", "kind": "取材・ファッションスナップ", "date": "2022年8月25日", "url": "https://advanced-time.shogakukan.co.jp/10861", "image": "https://advanced-time.shogakukan.co.jp/wp-content/uploads/2022/08/img_main__fashion_vol12_199.jpg"}, {"title": "「イケオジ」になる極意とは　トレンドは上品さと着やすさ　小物もうまく使って", "publisher": "産経新聞", "kind": "メディア掲載", "date": "2026年11月2日", "url": "https://www.sankei.com/article/20261102-ZWSRFFXXZZKU3NG3G244EAQBGM/?outputType=asynd", "image": "https://www.sankei.com/resizer/v2/IXSP7NAGVJJCHCERSBFKWKUDOY.jpg?auth=4a90a5c30edc55176d610ace4f4b4c5bafdf1a487b8af22ccb6e33dddb6da143&quality=50&smart=true&width=1200&height=675"}],
 "shibalife": [{"title": "【ゴルフ女子初心者#4】2ヶ月でスコア100切り達成！柴田花菜さん", "publisher": "GOLF FOCUS", "kind": "取材・インタビュー", "date": "2021年2月3日", "url": "https://info-golf.net/golf-girl-beginner4/", "image": "https://info-golf.net/wp-content/uploads/2020/08/golfgirl-beginner-photo3-e1598828217847-940x578.jpg"}, {"title": "リクルート じゃらん卒業、起業を経て。中目黒にプライベートサウナ「SAUNA汽汽」をつくっています", "publisher": "柴田花菜 本人note", "kind": "本人執筆・サウナづくり", "date": "2026年1月13日", "url": "https://note.com/shibatakana/n/n6bde38ca79b8", "image": "/shibata-kana-sauna.png"}],
 "ikki-yokoji": [{"title": "人のセンスに“リスペクトフィー”を。ファッション同行サービス14年目のプラットフォームが挑む次の市場", "publisher": "経道", "kind": "取材・インタビュー", "url": "https://kei-do.com/interview2/01004/", "image": "https://kei-do.com/wp-content/uploads/2026/01/da8c5c7782f9cf5213ca98524532ce3d.jpeg"}, {"title": "「ファッションアテンダント・横路一樹」18歳で商売をはじめた男の生き様とは", "publisher": "ニューアキンド", "kind": "取材・インタビュー", "url": "https://new.akind.center/yokoji-ikki/?amp=1", "image": "https://new.akind.center/wp-content/uploads/2017/01/ikkiyokoji3.png"}, {"title": "知識や経験を持つファッションオタクを悩みを抱える消費者とつなぐプラットフォーム", "publisher": "繊維月報／伊藤忠商事", "kind": "取材・インタビュー", "url": "https://www.itochu.co.jp/ja/business/textile/geppo/202005/sf03.html", "image": "https://www.itochu.co.jp/ja/business/textile/geppo/img/img_202005_feature_08.jpg"}, {"title": "スニーカーオタクの高校生がファッション業界で活躍する複業家になるまで【前編】", "publisher": "サイドラインズ", "kind": "取材・インタビュー", "url": "https://sidelines.jp/post-4530", "image": "https://sidelines.jp/wp-content/uploads/2018/11/46678165_371104180100678_1066115864752816128_n.jpg"}, {"title": "ラジオ「明日、なに着る？」#33 ゲスト：横路一樹「好きな服」より「魅せる服」！？", "publisher": "明日、なに着る？ 番組公式note", "kind": "ラジオ出演・番組書き起こし", "url": "https://note.com/asunani_radio/n/n1405e985552d", "image": "https://assets.st-note.com/production/uploads/images/302716554/rectangle_large_type_2_1b6bc1b2627aaa6104d635d0154c7ceb.png?fit=bounds&quality=85&width=1280"}],
 "mayumi-asakura": [{"title": "＜名古屋開催＞素敵なグレイヘアを楽しもう！ 朝倉真弓トークセミナー開催レポート！", "publisher": "LICOLO／ホーユー", "kind": "セミナー登壇・開催レポート", "url": "https://www.hoyu.co.jp/licolo/category/life-style/000747.html", "image": "/mayumi-media-0.jpg"}, {"title": "グレイヘアリスト朝倉真弓氏、人生１００年時代に「コンプレックスや劣等感解消し、人生明るく」", "publisher": "スポーツ報知", "kind": "取材・インタビュー", "url": "https://hochi.news/articles/20190925-OHT1T50096.html", "image": "/mayumi-media-1.jpg"}, {"title": "印象年齢マイナス10歳！ ウォーキング講師・朝倉真弓さんに教わる「美姿勢」のコツと「グレイヘア」の楽しみ方", "publisher": "毎日が発見ネット", "kind": "取材・インタビュー", "url": "https://mainichigahakken.net/posts/1385379", "image": "/mayumi-media-2.jpg"}],
 "ayano-tominaga": [{"title": "【動画で解説】Galaxy S24 UltraのAI機能をチェック", "publisher": "@DIME", "kind": "動画出演・製品解説", "url": "https://dime.jp/genre/1742805/", "image": "/ayano-media-0.jpg"}, {"title": "海外出張に欠かせない！海外ジャーナリストのScanSnap活用術", "publisher": "デジUP！／PFU", "kind": "執筆・活用事例", "url": "https://www.pfu.ricoh.com/scansnap/digiup/article/scansnap/00384/", "image": "/ayano-media-1.jpg"}, {"title": "ITジャーナリスト富永彩乃のインタビュー", "publisher": "メシ通／ホットペッパーグルメ", "kind": "取材・インタビュー", "url": "https://www.hotpepper.jp/mesitsu/entry/ten-ebihara/18-00176", "image": "/ayano-media-2.jpg"}, {"title": "ITジャーナリスト富永彩乃さんのスマホ活用術", "publisher": "美ST ONLINE", "kind": "取材・インタビュー", "url": "https://be-story.jp/people/12799/", "image": "/ayano-media-3.jpg"}, {"title": "iPhone 12はフロントカメラをもっと強化してくれたらVlogも撮りやすい", "publisher": "富永彩乃 公式サイト", "kind": "執筆記事・公式掲載情報", "url": "https://ayanotominaga.com/media/iphone-12/", "image": "/ayano-media-4.jpg"}],
 "lua-soda": [{"title": "海と山と人をつなぐ。都会のヤンキーが「旅する料理人」になるまで", "publisher": "Business Insider Japan", "kind": "取材・インタビュー", "url": "https://www.businessinsider.jp/article/208569/", "image": "/lua-media-0.jpg"}, {"title": "出張料理人ソウダルアがウクライナで食卓をつくって感じたこと", "publisher": "月見ル君想フ", "kind": "トークイベント出演", "url": "https://www.moonromantic.com/post/230918d", "image": "/lua-media-1.jpg"}, {"title": "美味しい旅に国境無し。出張料理人ルア参上。", "publisher": "RiCE.press", "kind": "本人寄稿・フードエッセイ", "url": "https://www.rice.press/talk/3054", "image": "/lua-media-2.jpg"}, {"title": "出張料理人 ソウダルア｜人間も空海山や生き物が成す生態系の一部", "publisher": "創業手帳", "kind": "取材・インタビュー", "url": "https://sogyotecho.jp/soudarua-interview/", "image": "/lua-media-3.jpg"}, {"title": "シェフinレジデンス実施報告（出張料理人／ソウダルア氏）", "publisher": "つぐも", "kind": "シェフ・イン・レジデンス活動報告", "url": "https://tsugumo.jp/archive/シェフinレジデンス実施報告with-出張料理人-ソウダル/", "image": "/lua-media-4.jpg"}],
 "coco": [{"title": "【JIC×キャリア】世界を旅するフォトグラファーCocoさんの体験談", "publisher": "Baguio JIC", "date": "2026年2月14日", "kind": "体験談・インタビュー", "url": "https://baguio-jic.com/ja/experiences-ja/15135/", "image": "/coco-profile.jpg"}],
 "mari-kumagai": [{title:"女性の顔を輝かせる光と影の魔術師",publisher:"週刊NY生活",kind:"取材・インタビュー",date:"2021年3月4日",url:"https://www.nyseikatsu.com/interview/03/2021/32062/",image:"https://www.nyseikatsu.com/wp-content/uploads/2021/03/809-8.jpg"}, {title:"熊谷 真理｜メイク・スキンケア講師／美容ライター",publisher:"CUSTOMLIFE",kind:"記事監修・専門家紹介",url:"https://customlife-media.jp/expert/kumagaimami",image:"https://c2.customlife-media.jp/c/s750/202108/7900c6fa-1deb-4000-bb2f-8a860768f6e8.jpg"}, {title:"熊谷真理｜資格者インタビュー",publisher:"日本化粧品検定協会",kind:"資格者インタビュー",url:"https://cosme-ken.org/page-interview/kumagaim/",image:"https://cosme-ken.org/newsite/wp-content/uploads/0SAcFesC4yMdSGo1656891534_1656891560.jpg"}]
};

export const walkExamples: Record<string, string> = {
  "takashi-onizawa": "インテリアや家具のデザインを見比べる",
  "satoshi-miya": "渋谷でレコードを探しながら、DJやダンスの話をする",
  ucci: "原宿でストリートブランドやレコード店をのぞく",
  "tetsuya-oi": "渋谷を歩きながら、ウォーキングや体の動かし方の話をする",
  "ikki-yokoji": "下北沢でブランド古着やリユースショップをめぐる",
  coco: "下北沢を歩きながら、街で見つけた風景を写真に撮る",
  "lua-soda": "築地で旬の食材を探しながら、食文化の話をする",
  "ayano-tominaga": "秋葉原でスマホや撮影用アクセサリーを見比べる",
  "tapi-style": "高円寺で古着やヴィンテージの服を探す",
  "mimic-takara": "下北沢の古着屋やレコード屋をのぞく",
  "waki-masayuki": "神保町の古本屋をめぐって気になる一冊を探す",
  shibalife: "中目黒でサウナやインテリアの話をしながら街を歩く",
  "mari-kumagai": "表参道でコスメを見比べながら、メイクの話をする",
  "takashi-yokoishi": "渋谷で書店や雑貨店をめぐり、気になる工芸品を探す",
  "mayumi-asakura": "銀座・有楽町で服やコスメを見比べる",
};

export const walkStyles: Partial<Record<string, string>> = {
  "akiko-kobayashi": "着物と和の所作を知る",
  "takashi-onizawa": "インテリアの視点で家具を見比べる",
  "satoshi-miya": "DJの目線でレコードを探す",
  ucci: "ストリートカルチャーの話をしながら店をのぞく",
  "tetsuya-oi": "歩きながら体の動かし方を聞く",
  "ikki-yokoji": "リユースの目線でブランド古着を探す",
  coco: "気になる街角を写真に撮りながら歩く",
  "lua-soda": "料理人の目線で旬の食材を探す",
  "ayano-tominaga": "使い方から撮影機材を見比べる",
  "tapi-style": "古着とヴィンテージの服を一緒に探す",
  "mimic-takara": "古着屋店主の目線で店をめぐる",
  "waki-masayuki": "書店主と古本屋をめぐり一冊を探す",
  shibalife: "サウナと空間づくりの話をしながら歩く",
  "mari-kumagai": "メイク講師とコスメを見比べる",
  "takashi-yokoishi": "書店や雑貨屋で気になる品を探す",
  "mayumi-asakura": "グレイヘアに合う服や化粧品を探す",
};
