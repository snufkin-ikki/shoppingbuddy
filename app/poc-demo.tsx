"use client";

import { useEffect, useState } from "react";

export const pocStages = [
  { key: "posted", label: "募集" },
  { key: "applied", label: "応募" },
  { key: "matched", label: "Buddy決定" },
  { key: "met", label: "合流" },
] as const;

type Stage = typeof pocStages[number]["key"];
type DemoEvent = { stage: Stage; time: number; entrySource?: string | null };
type DemoEvents = Record<string, DemoEvent>;

const storageKey = "shopping-buddy-poc-demo-v1";

export function readPocDemoEvents(): DemoEvents {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return Object.fromEntries(Object.entries(data).filter(([, value]) => {
      const item = value as DemoEvent | null;
      return item && Number.isFinite(item.time) && pocStages.some(stage => stage.key === item.stage);
    })) as DemoEvents;
  } catch {
    return {};
  }
}

export function usePocDemo() {
  const [events, setEvents] = useState<DemoEvents>({});

  useEffect(() => {
    const sync = () => setEvents(current => ({ ...current, ...readPocDemoEvents() }));
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function record(requestId: string, stage: Stage, entrySource?: string | null) {
    const key = `${requestId}:${stage}`;
    const previous = { ...events, ...readPocDemoEvents() };
    if (previous[key]) return;
    const next = { ...previous, [key]: { stage, time: Date.now(), entrySource } };
    setEvents(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {
      // The demo still works for the current page when storage is unavailable.
    }
  }

  return { events, record };
}

const day = 86_400_000;
const jst = 9 * 3_600_000;
const dateLabel = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", timeZone: "Asia/Tokyo" });

export function PocWeeklySummary({ events }: { events: DemoEvents }) {
  const [now, setNow] = useState<number | null>(null);

  const date = now ?? 0;
  const jstDate = new Date(date + jst);
  const monday = Math.floor((date + jst) / day) * day - ((jstDate.getUTCDay() + 6) % 7) * day - jst;
  const rows = pocStages.map(({ key, label }) => {
    const times = Object.values(events).filter(item => item.stage === key).map(item => item.time);
    const current = times.filter(time => time >= monday && time < monday + 7 * day).length;
    const previous = times.filter(time => time >= monday - 7 * day && time < monday).length;
    return { label, current, previous, change: current - previous };
  });

  return <details className="poc-weekly" onToggle={event => { if (event.currentTarget.open) setNow(Date.now()); }}>
    <summary>PoC週次ダッシュボード（デモ）</summary>
    {now !== null && <>
      <p>このブラウザで行ったデモ操作を集計します。週は月曜始まり（日本時間）です。</p>
      <table>
        <caption>前週から変わったこと</caption>
        <thead><tr><th scope="col">項目</th><th scope="col">今週<br />{dateLabel.format(monday)}〜</th><th scope="col">前週<br />{dateLabel.format(monday - 7 * day)}〜</th><th scope="col">差</th></tr></thead>
        <tbody>{rows.map(({ label, current, previous, change }) => <tr key={label}>
          <th scope="row">{label}</th><td>{current}</td><td>{previous}</td><td>{change > 0 ? "+" : ""}{change}</td>
        </tr>)}</tbody>
      </table>
    </>}
  </details>;
}
