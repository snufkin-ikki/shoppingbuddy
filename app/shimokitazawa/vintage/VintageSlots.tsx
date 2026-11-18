"use client";

import { useEffect, useState } from "react";
import { recordVintageStep, vintageDemoHref } from "../../shimokitazawa-entry";
import { upcomingVintageSlots, vintageSlotRequestHref, vintageWalkDuration } from "../../shimokitazawa-slots";

const storageKey = "shopping-buddy-shimokitazawa-vintage-interest";
const preferences = ["曜日指定なし", "平日", "土日"] as const;
type Preference = typeof preferences[number];

export default function VintageSlots({ source }: { source: string }) {
  const [slots, setSlots] = useState<ReturnType<typeof upcomingVintageSlots> | null>(null);
  const [saved, setSaved] = useState<Preference | null>(null);
  const [preference, setPreference] = useState<Preference>("曜日指定なし");
  const [status, setStatus] = useState("");

  useEffect(() => {
    function sync() {
      setSlots(upcomingVintageSlots());
      try {
        const stored = preferences.find(item => item === localStorage.getItem(storageKey)) ?? null;
        setSaved(stored);
        setPreference(stored ?? "曜日指定なし");
      } catch {
        // The example slots still work without browser storage.
      }
    }
    sync();
    window.addEventListener("pageshow", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pageshow", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function save(next: Preference | null) {
    try {
      if (next) {
        localStorage.setItem(storageKey, next);
        recordVintageStep(source, "saved");
      } else {
        localStorage.removeItem(storageKey);
      }
      setSaved(next);
      setStatus(next ? `希望を保存しました（${next}）。` : "保存した希望を取り消しました。");
    } catch {
      setStatus("ブラウザの設定により希望を保存できませんでした。");
    }
  }

  return <section id="vintage-slots" className="vintage-slots" aria-labelledby="vintage-slots-title">
    <h2 id="vintage-slots-title">下北沢を歩く時間を選ぶ</h2>
    <div className="vintage-slot-grid">
      <article>
        <h3>今日の空き時間で歩きたい</h3>
        <p>何時に歩きたいかを決めて、Buddyへの募集を試せます。</p>
        <a className="vintage-primary" href={vintageDemoHref(source, "public-board")}>希望を書いてBuddyを募る</a>
      </article>
      <article>
        <h3>日時を選んで歩きたい</h3>
        <p>以下は操作例です。Buddyの実際の空き枠・予約は確認できません。</p>
        {slots && <ul className="vintage-slot-list">{slots.map(slot => <li key={slot.localTime}>
          <a href={vintageSlotRequestHref(source, slot.localTime)}>
            <time dateTime={slot.localTime + "+09:00"}>{slot.label}（日本時間）</time>
            <span>{vintageWalkDuration}で募集を試す →</span>
          </a>
        </li>)}</ul>}
      </article>
      <article>
        <h3>合う日時が見つからない</h3>
        <form onSubmit={event => { event.preventDefault(); save(preference); }}>
          <label>希望の曜日<select value={preference} onChange={event => {
            const value = preferences.find(item => item === event.target.value);
            if (value) setPreference(value);
          }}>{preferences.map(item => <option key={item}>{item}</option>)}</select></label>
          <p>下北沢 × 古着 × {vintageWalkDuration}の希望をこのブラウザに保存します。</p>
          <div className="vintage-preference-actions">
            <button type="submit" disabled={saved === preference}>{saved ? "希望を更新" : "希望を保存"}</button>
            {saved && <button type="button" onClick={() => save(null)}>保存を取り消す</button>}
          </div>
          <p>デモでは空き枠の通知は届きません。</p>
          <p className="vintage-save-status" role="status">{status || (saved ? `保存中の希望（${saved}）` : "")}</p>
        </form>
      </article>
    </div>
  </section>;
}
