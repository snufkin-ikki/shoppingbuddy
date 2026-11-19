export const occupations = {
  owner: { ja: "経営者・店主", en: "Business or shop owner", zh: "经营者・店主" },
  founder: { ja: "起業家", en: "Entrepreneur", zh: "创业者" },
  singer: { ja: "シンガー", en: "Singer", zh: "歌手" },
  actor: { ja: "俳優", en: "Actor", zh: "演员" },
  maker: { ja: "ものづくりクリエイター", en: "Maker or craft creator", zh: "手作创作者" },
  retail: { ja: "ショップ店員", en: "Shop staff", zh: "店员" },
  dj: { ja: "DJ・ダンサー", en: "DJ or dancer", zh: "DJ・舞者" },
  photographer: { ja: "フォトグラファー", en: "Photographer", zh: "摄影师" },
  writer: { ja: "作家・ライター／ジャーナリスト", en: "Author, writer or journalist", zh: "作家・撰稿人・记者" },
  producer: { ja: "プロデューサー", en: "Producer", zh: "制作人" },
  instructor: { ja: "講師・トレーナー", en: "Instructor or trainer", zh: "讲师・教练" },
  model: { ja: "モデル", en: "Model", zh: "模特" },
  chef: { ja: "料理人", en: "Chef", zh: "厨师" },
  interiors: { ja: "インテリアコーディネーター", en: "Interior coordinator", zh: "室内搭配师" },
} as const;

type Occupation = keyof typeof occupations;
export const occupationsByBuddy: Readonly<Record<string, readonly Occupation[]>> = {
  "akiko-kobayashi": ["actor"],
  "takashi-onizawa": ["interiors"],
  "satoshi-miya": ["dj", "producer"],
  ucci: ["owner", "producer", "dj"],
  "tetsuya-oi": ["instructor"],
  "ikki-yokoji": ["owner", "founder"],
  coco: ["photographer"],
  "lua-soda": ["chef"],
  "ayano-tominaga": ["writer"],
  "mimic-takara": ["owner"],
  "waki-masayuki": ["owner", "writer"],
  "mari-kumagai": ["founder", "instructor"],
  "takashi-yokoishi": ["founder", "producer", "writer"],
  "mayumi-asakura": ["instructor", "model", "writer"],
};

// Use publicly documented dates, keeping year/month precision when the exact day is unavailable.
const birthDates: Readonly<Record<string, string>> = {
  "akiko-kobayashi": "1977-10-19", // https://aki-corp.jimdofree.com/
  "takashi-yokoishi": "1978", // https://www.twdw.jp/2013/speakers/index.html
  "mayumi-asakura": "1971-08", // https://kouen-dx.com/databox/data.php/code-01255/code
};

export const ageDecades = [20, 30, 40, 50, 60, 70, 80, 90] as const;

function ageRange(profileId: string, now: Date) {
  const birthDate = birthDates[profileId];
  if (!birthDate) return null;

  const [year, month, day] = birthDate.split("-").map(Number);
  const today = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const estimate = today.getUTCFullYear() - year;
  const currentMonth = today.getUTCMonth() + 1;
  if (!month || (currentMonth === month && !day)) return [estimate - 1, estimate];
  const birthdayPassed = currentMonth > month || (currentMonth === month && today.getUTCDate() >= day);
  const age = estimate - Number(!birthdayPassed);
  return [age, age];
}

export function knownExactAges(now = new Date()) {
  return [...new Set(Object.keys(birthDates).flatMap(profileId => {
    const range = ageRange(profileId, now);
    return range && range[0] === range[1] ? [range[0]] : [];
  }))].sort((a, b) => a - b);
}

export function matchesBuddyAge(profileId: string, filter: string, now: Date) {
  const range = ageRange(profileId, now);
  if (!range) return false;
  const [kind, ageText] = filter.split(":");
  const age = Number(ageText);
  if (kind === "exact") return range.every(value => value === age);
  return kind === "decade" && range[0] >= age && range[1] < age + 10;
}
