"use client";

import { useRef, useState } from "react";

export type WalkStage = "matched" | "planning" | "agreement" | "scheduled" | "meetup" | "met" | "completed";

const stageLabels: Record<WalkStage, string> = {
  matched: "待ち合わせ未定",
  planning: "待ち合わせを調整中",
  agreement: "リスペクトフィー確認",
  scheduled: "支払い確認済み（デモ）",
  meetup: "待ち合わせ確定",
  met: "合流済み",
  completed: "街歩き完了",
};

export default function TodayWalk({ buddy, area, when, duration, suggestedFee, stage, setStage, onMeet }: {
  buddy: string;
  area: string;
  when: string;
  duration: string;
  suggestedFee: number | null;
  stage: WalkStage;
  setStage: (stage: WalkStage) => void;
  onMeet: () => void;
}) {
  const [meetingTime, setMeetingTime] = useState(when === "今すぐ" ? "" : when);
  const [meetingPlace, setMeetingPlace] = useState("");
  const [amount, setAmount] = useState(suggestedFee?.toString() ?? "");
  const [feedback, setFeedback] = useState({ visitor: "", buddy: "" });
  const [saved, setSaved] = useState<typeof feedback | null>(null);
  const fee = Number(amount);
  const validFee = /^[1-9]\d*$/.test(amount) && Number.isSafeInteger(fee);
  const feeLabel = validFee ? `${fee.toLocaleString("ja-JP")}円` : "未入力";
  const statusRef = useRef<HTMLParagraphElement>(null);
  const hasPlan = stage !== "matched" && stage !== "planning";

  function goTo(next: WalkStage) {
    setStage(next);
    if (next !== "planning") {
      requestAnimationFrame(() => statusRef.current?.focus({ preventScroll: true }));
    }
  }

  return (
    <section className="today-walk" aria-labelledby="today-walk-title">
      <div className="today-walk-heading">
        <div>
          <span className="request-step">マッチ後のデモ</span>
          <h3 id="today-walk-title" tabIndex={-1}>今日の街歩き</h3>
        </div>
        <p className="today-walk-status" tabIndex={-1} ref={statusRef}>{stageLabels[stage]}</p>
      </div>
      <dl className="today-walk-details">
        <div><dt>一緒に歩くBuddy</dt><dd>{buddy}</dd></div>
        <div><dt>エリア</dt><dd>{area}</dd></div>
        <div><dt>{hasPlan ? "待ち合わせ日時" : "希望日時"}</dt><dd>{hasPlan ? meetingTime : when}</dd></div>
        <div><dt>街歩きの時間</dt><dd>{duration}</dd></div>
      </dl>

      {stage === "matched" && <>
        <p>Buddyと相談した街歩きの条件をまとめましょう。</p>
        <button className="request-apply" type="button" id="today-walk-next" onClick={() => goTo("planning")}>街歩きの条件をまとめる →</button>
      </>}

      {stage === "planning" && <form className="request-form" onSubmit={event => {
        event.preventDefault();
        if (!meetingTime.trim() || !meetingPlace.trim() || !validFee) return;
        setMeetingTime(meetingTime.trim());
        setMeetingPlace(meetingPlace.trim());
        goTo("agreement");
      }}>
        <p>チャットで合意した金額と、待ち合わせの日時・場所を入力してください。</p>
        <div className="today-walk-form-fields">
          <label>待ち合わせ日時<input id="today-walk-time" required autoFocus maxLength={40} value={meetingTime}
            onChange={event => setMeetingTime(event.target.value)} placeholder="例：今日 15:30" /></label>
          <label>待ち合わせ場所<input required maxLength={100} value={meetingPlace}
            onChange={event => setMeetingPlace(event.target.value)} placeholder="例：駅の改札前" /></label>
          <label>リスペクトフィー（円）<input required type="text" inputMode="numeric" pattern="[1-9][0-9]*" maxLength={9} value={amount}
            onChange={event => setAmount(event.target.value)} placeholder="合意した金額を入力" /></label>
        </div>
        <button className="request-apply" type="submit" disabled={!meetingTime.trim() || !meetingPlace.trim() || !validFee}>合意した内容を確認する</button>
      </form>}

      {hasPlan && <div className="walk-fee-summary">
        <dl className="today-walk-details">
          <div><dt>リスペクトフィー</dt><dd>{feeLabel}</dd></div>
          <div><dt>支払総額（デモ）</dt><dd>{feeLabel}</dd></div>
        </dl>
        <p>{buddy}さんと過ごす時間の利用料金です。お支払い先はShopping Buddyです。</p>
      </div>}
      {stage === "agreement" && <div className="today-walk-actions">
        <button className="request-apply" type="button" id="today-walk-next" onClick={() => goTo("scheduled")}>支払いを確認する（デモ）</button>
        <button className="request-edit" type="button" onClick={() => goTo("planning")}>合意内容を修正する</button>
        <small>実際の請求はありません。</small>
      </div>}

      {stage === "scheduled" && <button className="request-apply" type="button" id="today-walk-next" onClick={() => goTo("meetup")}>集合場所を確認する →</button>}

      {(stage === "meetup" || stage === "met") && <p className="today-walk-location">
        <strong>待ち合わせ場所</strong> {meetingPlace}
      </p>}

      {stage === "meetup" && <div className="today-walk-actions">
        <button className="request-apply" type="button" onClick={() => { onMeet(); goTo("met"); }}>合流できた</button>
        <button className="request-edit" type="button" onClick={() => goTo("planning")}>時間・場所を修正する</button>
      </div>}

      {stage === "met" && <button className="request-apply" type="button" id="today-walk-next" onClick={() => goTo("completed")}>街歩きを完了する</button>}

      {stage === "completed" && <form className="demo-discovery" onSubmit={event => {
        event.preventDefault();
        setSaved({ visitor: feedback.visitor.trim(), buddy: feedback.buddy.trim() });
      }}>
        <h4>街歩きのあとに、お互いへひとこと</h4>
        <p>デモ内の振り返りです。実際の利用者向け口コミは、運営から届く専用リンクで投稿できます。</p>
        <label htmlFor="demo-discovery-note">利用者として、Buddyのどんな話や視点が印象に残りましたか？</label>
        <textarea id="demo-discovery-note" maxLength={100} value={feedback.visitor}
          onChange={event => setFeedback({ ...feedback, visitor: event.target.value })}
          placeholder="例：古着屋店主ならではの下北沢の話が印象に残った" />
        <label htmlFor="demo-buddy-note">Buddyとして、相手とどんな時間を過ごせましたか？</label>
        <textarea id="demo-buddy-note" maxLength={100} value={feedback.buddy}
          onChange={event => setFeedback({ ...feedback, buddy: event.target.value })} />
        <button type="submit" disabled={(!feedback.visitor.trim() && !feedback.buddy.trim()) ||
          (saved?.visitor === feedback.visitor.trim() && saved.buddy === feedback.buddy.trim())}>振り返りを残す</button>
        {saved && <p role="status">振り返りをデモに記録しました。</p>}
      </form>}

      <small>デモの操作内容は、このページ内に表示されます。</small>
    </section>
  );
}
