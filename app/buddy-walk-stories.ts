import type { SiteLanguage } from "./site-language";

type WalkStory = { area: string; activity: string; topic: string; forWhom: string };

export const walkStories: Partial<Record<string, Record<SiteLanguage, WalkStory>>> = {
  "mimic-takara": {
    ja: { area: "下北沢", activity: "古着屋やレコード屋をのぞく", topic: "古着屋店主の裏話と、下北沢の今と昔", forWhom: "『ザ・ノンフィクション』で宝さんを知った人や、マニアックなお店をのぞきたい人" },
    en: { area: "Shimokitazawa", activity: "Browse vintage clothing and record shops", topic: "Stories from a vintage shop owner and how Shimokitazawa has changed", forWhom: "People who saw Takara on The Nonfiction or want to browse niche shops" },
    zh: { area: "下北泽", activity: "逛古着店和唱片店", topic: "古着店主的幕后故事，以及下北泽的过去和现在", forWhom: "看过《ザ・ノンフィクション》认识宝的人，或想逛小众店铺的人" },
  },
  "ikki-yokoji": {
    ja: { area: "下北沢", activity: "ブランド古着やリユースショップをめぐる", topic: "衣料品の買取・販売経験から見る、リユースの面白さ", forWhom: "古着を見比べたり、リユースの話をしながら歩いたりしたい人" },
    en: { area: "Shimokitazawa", activity: "Browse secondhand designer clothing and resale shops", topic: "What makes resale interesting, from experience buying and selling clothes", forWhom: "People who want to compare vintage finds and talk about resale" },
    zh: { area: "下北泽", activity: "逛二手品牌服饰店和再售商店", topic: "从服装收购和销售经验聊聊二手服饰的乐趣", forWhom: "想比较古着、边走边聊二手服饰的人" },
  },
  coco: {
    ja: { area: "下北沢", activity: "気になる街角を、写真を撮りながら歩く", topic: "フォトグラファーが、旅先や街角で見つける風景", forWhom: "写真を撮りながら街をゆっくり歩きたい人" },
    en: { area: "Shimokitazawa", activity: "Take photos as you explore corners of the neighborhood", topic: "What a photographer notices while traveling and walking through a city", forWhom: "People who want to take photos on a leisurely walk" },
    zh: { area: "下北泽", activity: "边散步边拍下感兴趣的街角", topic: "聊聊摄影师在旅行和街头发现的风景", forWhom: "想慢慢逛街、顺便拍照的人" },
  },
};

export const walkStoryCopy = {
  ja: { title: "このBuddyとの1時間", activity: "何をする？", topic: "どんな話が聞ける？", forWhom: "どんな人に合う？", example: "街歩きの一例", storyLabel: "街歩き例", social: "SNS・取材を見る", instagram: "SNSを見る", media: "取材・出演を見る", section: "SNS・取材実績", language: "Buddyの対応言語", english: "英語対応可", ask: "この街でBuddyを探してもらう", missingArea: "エリア未設定", unlisted: "料金未設定" },
  en: { title: "An hour with this Buddy", activity: "What might you do?", topic: "What might you talk about?", forWhom: "Who might enjoy it?", example: "Example walk", storyLabel: "Example walk", social: "Social posts & press", instagram: "See social posts", media: "See press & appearances", section: "Social posts and press", language: "Languages the Buddy speaks", english: "English available", ask: "Ask us to find a Buddy in this area", missingArea: "Area not listed", unlisted: "Rate not listed" },
  zh: { title: "和这位伙伴一起逛 30 分钟", activity: "会做些什么？", topic: "可以聊什么？", forWhom: "适合谁？", example: "街区漫步示例", storyLabel: "漫步示例", social: "查看社交动态和媒体报道", instagram: "查看社交动态", media: "查看采访和出镜", section: "社交动态与媒体报道", language: "伙伴可使用的语言", english: "可用英语交流", ask: "请帮我在这个街区找伙伴", missingArea: "尚未公布区域", unlisted: "尚未公布费用" },
};
