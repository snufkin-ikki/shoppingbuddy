export type BuddyIntroduction = {
  authorId: string;
  relationship?: string;
  strengths: string;
  experience: string;
  goodFor: string;
};

// Each key is the profile being introduced. Add the author's final copy here.
export const buddyIntroductions: Readonly<Record<string, readonly BuddyIntroduction[]>> = {
  "mimic-takara": [{
    authorId: "ikki-yokoji",
    strengths: "宝くんは、飄々としていて、親しみやすい古着屋店主。話しかけやすくて、気軽に一緒に歩ける人です。",
    experience: "古着屋オーナーならではの裏話や、下北沢の今と昔の話を聞きながら、古着屋はもちろん、ちょっとマニアックなお店ものぞいてみる。宝くんとの街歩き、その時間ごとエンタメ感覚で楽しんでほしいですね♪",
    goodFor: "下北沢でいつもと違うお店をのぞいてみたい方、古着屋の裏話や街の昔話が好きな方。フジテレビの『ザ・ノンフィクション』を見て、宝くんの人柄が好きになった方には、ぜひ一緒に歩いてみてほしいです！！",
  }],
};
