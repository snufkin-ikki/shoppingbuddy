const chapters = [
  { title: "ROOTS（原点）", questions: [
    "まず、ご自身と今の活動について教えてください。",
    "カルチャーに最初に「撃ち抜かれた」瞬間はいつですか？",
    "10代の自分が通い詰めていた街やお店はどこですか？",
    "「あのときは思い切ったな」と今でも覚えているモノは何ですか？ どこに惚れましたか？",
    "18歳の自分に、何と伝えたいですか？",
  ] },
  { title: "TASTE（審美眼）", questions: [
    "「センスがいい人」とは、どんな人だと思いますか？",
    "今いちばん刺激をくれる本・映画・音楽は何ですか？",
    "流行と自分の“好き”がズレたとき、どうしますか？",
    "人生で最も影響を受けた人は誰ですか？",
    "あなたの座右の銘は何ですか？",
  ] },
  { title: "STREET（街と時間）", questions: [
    "今、一番歩いていて楽しい街はどこですか？",
    "予定が急に空いた1時間、何をして過ごしますか？",
    "買わないのに入ってしまうお店はどこですか？",
    "一人で歩く街と、誰かと歩く街は何が違いますか？",
    "見知らぬ誰かとの偶然の出会いで、人生が動いた経験はありますか？",
  ] },
  { title: "NEXT（これから）", questions: [
    "今までの人生で手放して良かったものは何ですか？",
    "もし無一文になったら、何から始めますか？",
    "あなたが誰かの「バディ」として街を案内するなら、どこへ連れて行きますか？ 2つ挙げてください。",
    "これから挑戦したいことは何ですか？",
    "あなたにとって、「好き」とは何ですか？",
  ] },
];

const answers: Record<string, Partial<Record<number, string>>> = {};

export default function ProfileWindows({ buddyId }: { buddyId: string }) {
  return (
    <section className="profile-windows" aria-labelledby="windows-title" lang="ja">
      <h3 id="windows-title">20 WINDOWS <small>by SHöPPiNG BuDDY</small></h3>
      {chapters.map(({ title, questions }, chapter) => (
        <details key={title}>
          <summary><small>CHAPTER {chapter + 1}｜</small>{title}</summary>
          <dl>{questions.map((question, index) => {
            const number = chapter * 5 + index + 1;
            return <div key={number}>
              <dt><span>{String(number).padStart(2, "0")}.</span> {question}</dt>
              <dd>{answers[buddyId]?.[number] ?? ""}</dd>
            </div>;
          })}</dl>
        </details>
      ))}
    </section>
  );
}
