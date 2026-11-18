"use client";

import { useEffect, useState } from "react";
import { entrySource, recordVintageStep, vintageEntryCounts } from "../../shimokitazawa-entry";

import { pocStages, readPocDemoEvents } from "../../poc-demo";

export default function EntryTools({ source, shopHref, socialLinks }: {
  source: string;
  shopHref: string;
  socialLinks: { name: string; href: string }[];
}) {
  const [counts, setCounts] = useState<ReturnType<typeof vintageEntryCounts>>([]);
  const [requestCounts, setRequestCounts] = useState<Record<string, Record<string, number>>>({});
  const sources = Array.from(new Set([...counts.map(row => row.source), ...Object.keys(requestCounts)])).sort();
  const sourceLabel = (value: string) => value === "direct" ? "直接アクセス" : value;

  useEffect(() => {
    recordVintageStep(source, "visit");
  }, [source]);

  return <details className="vintage-tools" onToggle={event => {
    if (!event.currentTarget.open) return;
    setCounts(vintageEntryCounts());
    const bySource: Record<string, Record<string, number>> = {};
    for (const item of Object.values(readPocDemoEvents())) {
      if (typeof item.entrySource !== "string") continue;
      const source = entrySource(item.entrySource);
      const stages = bySource[source] ?? {};
      stages[item.stage] = (stages[item.stage] ?? 0) + 1;
      bySource[source] = stages;
    }
    setRequestCounts(bySource);
  }}>
    <summary>下北沢PoC用リンクと集計（デモ）</summary>
    <p>店頭QRは動作確認用です。協力店が決まったら、URLの <code>from=shop-demo</code> を店舗ごとに変えると、店別に集計できます。</p>
    <div className="vintage-qr">
      <img src="/shimokitazawa-vintage-qr.png" width={128} height={128} alt="下北沢の古着屋めぐりを開くデモ用QRコード" />
      <div><a href={shopHref}>店頭QRのリンクを開く</a><br /><a href="/shimokitazawa-vintage-qr.png" download>デモ用QR画像を保存</a></div>
    </div>
    <p>BuddyのSNSには、本人のプロフィールに直接移動するリンクを使えます。</p>
    <ul>{socialLinks.map(link => <li key={link.href}><a href={link.href}>{link.name}のSNS用リンクを開く</a></li>)}</ul>
    <p>このブラウザのデモ操作を集計します。入口の操作は1セッションにつき各1回、募集以降は募集1件につき各1回です。</p>
    <div className="vintage-table-scroll" tabIndex={0} role="region" aria-label="入口の操作数">
    <table>
      <caption>流入元ごとの操作数</caption>
      <thead><tr><th scope="col">流入元</th><th scope="col">訪問</th><th scope="col">プロフィール閲覧</th><th scope="col">募集開始</th><th scope="col">サンプル枠選択</th><th scope="col">希望保存</th></tr></thead>
      <tbody>{counts.map(row => <tr key={row.source}>
        <th scope="row">{sourceLabel(row.source)}</th>
        <td>{row.visit}</td><td>{row.profile}</td><td>{row.request}</td><td>{row.slot}</td><td>{row.saved}</td>
      </tr>)}</tbody>
    </table>
    </div>
    <div className="vintage-table-scroll" tabIndex={0} role="region" aria-label="募集から合流までの操作数">
      <table>
        <caption>流入元ごとの募集から合流まで</caption>
        <thead><tr><th scope="col">流入元</th>{pocStages.map(stage => <th scope="col" key={stage.key}>{stage.label}</th>)}</tr></thead>
        <tbody>{sources.map(value => <tr key={value}><th scope="row">{sourceLabel(value)}</th>
          {pocStages.map(stage => <td key={stage.key}>{requestCounts[value]?.[stage.key] ?? 0}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </details>;
}
