export const travelMapBounds = {
  japan: [120, 151, 22, 47],
  asia: [91, 151, -4, 47],
  world: [-175, 180, -55, 83],
} as const;

export type TravelRegion = keyof typeof travelMapBounds;

type TravelDestination = {
  names: readonly [ja: string, en: string, zh: string];
  point: readonly [longitude: number, latitude: number];
  areas?: readonly string[];
};

const tokyo = [139.69, 35.69] as const;
const osaka = [135.5, 34.7] as const;

export const travelDestinations: Record<TravelRegion, readonly TravelDestination[]> = {
  japan: [
    { names: ["京都", "Kyoto", "京都"], point: [135.77, 35.02], areas: ["京都河原町"] },
    { names: ["渋谷", "Shibuya", "涩谷"], point: tokyo },
    { names: ["下北沢・高円寺", "Shimokitazawa & Koenji", "下北泽・高圆寺"], point: tokyo, areas: ["下北沢", "高円寺"] },
    { names: ["浅草", "Asakusa", "浅草"], point: tokyo },
    { names: ["銀座", "Ginza", "银座"], point: tokyo, areas: ["銀座有楽町"] },
    { names: ["新宿", "Shinjuku", "新宿"], point: tokyo },
    { names: ["名古屋栄・大須", "Nagoya · Sakae & Osu", "名古屋荣・大须"], point: [136.91, 35.16], areas: ["名古屋栄", "大須"] },
    { names: ["大阪梅田・心斎橋", "Osaka · Umeda & Shinsaibashi", "大阪梅田・心斋桥"], point: osaka, areas: ["梅田", "大阪梅田", "心斎橋"] },
    { names: ["大阪梅田", "Osaka · Umeda", "大阪梅田"], point: osaka, areas: ["梅田"] },
    { names: ["福岡博多・天神", "Fukuoka · Hakata & Tenjin", "福冈博多・天神"], point: [130.41, 33.59], areas: ["博多天神", "福岡天神", "博多", "天神"] },
    { names: ["沖縄那覇", "Okinawa · Naha", "冲绳那霸"], point: [127.68, 26.21], areas: ["那覇"] },
    { names: ["仙台一番町", "Sendai · Ichibancho", "仙台一番町"], point: [140.87, 38.26], areas: ["一番町"] },
    { names: ["札幌大通", "Sapporo · Odori", "札幌大通"], point: [141.35, 43.06], areas: ["大通"] },
  ],
  asia: [
    { names: ["台北", "Taipei", "台北"], point: [121.57, 25.04] },
    { names: ["ソウル", "Seoul", "首尔"], point: [126.98, 37.56] },
    { names: ["香港", "Hong Kong", "香港"], point: [114.17, 22.32] },
    { names: ["上海", "Shanghai", "上海"], point: [121.47, 31.23] },
    { names: ["北京", "Beijing", "北京"], point: [116.41, 39.9] },
    { names: ["シンガポール", "Singapore", "新加坡"], point: [103.82, 1.35] },
    { names: ["バンコク", "Bangkok", "曼谷"], point: [100.5, 13.76] },
  ],
  world: [
    { names: ["ハワイ", "Hawaii", "夏威夷"], point: [-157.86, 21.31], areas: ["ホノルル"] },
    { names: ["ロンドン", "London", "伦敦"], point: [-0.13, 51.51] },
    { names: ["パリ", "Paris", "巴黎"], point: [2.35, 48.86] },
    { names: ["バルセロナ", "Barcelona", "巴塞罗那"], point: [2.17, 41.39] },
    { names: ["ニューヨーク", "New York", "纽约"], point: [-74.01, 40.71] },
    { names: ["サンフランシスコ", "San Francisco", "旧金山"], point: [-122.42, 37.77] },
    { names: ["ポートランド", "Portland", "波特兰"], point: [-122.68, 45.52] },
    { names: ["ロサンゼルス", "Los Angeles", "洛杉矶"], point: [-118.24, 34.05] },
  ],
};

const destinationAliases = new Map(Object.values(travelDestinations).flat()
  .map(({ names, areas }) => [names[0], areas] as const));

export function matchesDestinationArea(profileAreas: readonly string[], area: string) {
  const aliases = destinationAliases.get(area);
  return profileAreas.some(place => place === area || aliases?.includes(place));
}
