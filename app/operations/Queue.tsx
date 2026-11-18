"use client";

import { useEffect, useState } from "react";
import { normalizeLineContact } from "../buddy-search-request";
import { profiles } from "../directory-data";

type Item = {
  id: string;
  kind: "line" | "review" | "introduction";
  receivedAt: number;
  area: string;
  description: string | null;
  lineKind: "id" | "link" | null;
  lineContact: string | null;
};

const endpoint = "/api/operations/queue";
const labels = { line: "LINE折り返し待ち", review: "User Voiceの承認待ち", introduction: "他己紹介の確認待ち" };
const dateFormat = new Intl.DateTimeFormat("ja-JP", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Tokyo" });

function buddyName(id: string) {
  return profiles.find(profile => profile.id === id)?.name ?? id;
}

export default function Queue() {
  const [data, setData] = useState<{ items: Item[]; more: boolean } | null>(null);
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint + "?page=" + page, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) { setError(result.error); return; }
        if (page > 0 && !result.items.length) setPage(page - 1);
        else setData(result);
      }).catch(() => {
        if (!controller.signal.aborted) setError("対応待ちを読み込めませんでした。");
      });
    return () => controller.abort();
  }, [page, revision]);

  function reload(nextPage = page) {
    setData(null);
    setError("");
    setPage(nextPage);
    setRevision(value => value + 1);
  }

  async function markContacted(id: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
      });
      if (!response.ok) { setError((await response.json()).error); return; }
      setNotice("LINE連絡済みにしました。");
      reload();
    } catch {
      setError("更新できませんでした。時間をおいてお試しください。");
    } finally {
      setBusy(false);
    }
  }

  return <>
    {error && <p role="alert" className="buddy-finder-error">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {!data && !error && <p role="status">対応待ちを読み込み中…</p>}
    {(data || error) && <div className="user-voice-controls">
      <button type="button" disabled={busy} onClick={() => reload()}>一覧を更新</button>
    </div>}
    {data && <>
      <p>受付が古いものから表示しています。</p>
      {!data.items.length && <p>対応待ちはありません。</p>}
      <ul className="buddy-introduction-list operations-queue">
        {data.items.map(item => <li key={item.kind + item.id} className="buddy-introduction">
          <strong>{labels[item.kind]}</strong>
          <p>受付 <time dateTime={new Date(item.receivedAt).toISOString()}>{dateFormat.format(item.receivedAt)}</time>
            {" · "}{Math.max(0, Math.floor((Date.now() - item.receivedAt) / 86_400_000))}日経過</p>
          {item.kind === "line" ? <>
            <h2>{item.area}</h2><p className="user-voice-body">{item.description}</p>
            {item.lineKind === "link" ? <a href={normalizeLineContact(item.lineKind, item.lineContact) ?? undefined} target="_blank" rel="noopener noreferrer">LINEプロフィールを開く</a>
              : <p>LINE ID <strong>{item.lineContact}</strong></p>}
            <div className="user-voice-controls">
              <button type="button" disabled={busy} onClick={() => markContacted(item.id)}>連絡済みにする</button>
            </div>
          </> : <>
            <h2>{item.description ? buddyName(item.description) + " → " : ""}{buddyName(item.area)}</h2>
            <a href={item.kind === "review" ? "/user-voice/operations#review-" + item.id : "/buddy-network?view=operations#intro-" + item.id}>
              {item.kind === "review" ? "口コミを確認する" : "紹介文を確認する"} →
            </a>
          </>}
        </li>)}
      </ul>
      {(page > 0 || data.more) && <div className="user-voice-controls">
        <button disabled={!page || busy} onClick={() => reload(page - 1)}>前へ</button>
        <button disabled={!data.more || busy} onClick={() => reload(page + 1)}>次へ</button>
      </div>}
    </>}
  </>;
}
