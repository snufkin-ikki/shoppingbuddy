"use client";

import { useEffect, useState, type FormEvent } from "react";
import { profiles } from "../../directory-data";

const endpoint = "/api/user-voice/operations";
const statuses = { pending: "確認待ち", approved: "掲載中", rejected: "掲載見送り" };
type Status = keyof typeof statuses;
type Review = { id: string; buddyId: string; reference: string; rating: number; body: string };

export default function Operations() {
  const [status, setStatus] = useState<Status>("pending");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<{ reviews: Review[]; more: boolean } | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    const focus = location.hash.startsWith("#review-") ? location.hash.slice(8) : "";
    fetch(endpoint + "?" + new URLSearchParams({ status, page: String(page), focus }), { signal: controller.signal })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) {
          if (response.status === 403) setAuthorized(false);
          setError(result.error);
          return;
        }
        setAuthorized(true);
        if (page > 0 && !result.reviews.length) setPage(page - 1);
        else setData(result);
      }).catch(() => { if (!controller.signal.aborted) setError("一覧を読み込めませんでした。"); });
    return () => controller.abort();
  }, [status, page, revision]);

  useEffect(() => {
    if (data && location.hash.startsWith("#review-")) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "center" });
    }
  }, [data]);

  async function post(input: object) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      return result;
    } catch {
      setError("処理できませんでした。もう一度お試しください。");
    } finally {
      setBusy(false);
    }
  }

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const result = await post({ action: "invite", buddyId: form.get("buddyId"), reference: form.get("reference") });
    if (!result) return;
    setLink(location.origin + result.path);
    formElement.reset();
  }

  async function moderate(id: string, action: string, message: string) {
    if (!(await post({ id, action }))) return;
    setNotice(message);
    setRevision(value => value + 1);
  }

  return <>
    {authorized && <>
      <p><a href="/operations">運営の対応待ち一覧へ</a></p>
      <h2>利用後の投稿リンクを発行</h2>
      <p>実際の利用を確認してから発行し、利用者に共有してください。リンクの有効期間は30日で、投稿は1回です。投稿前に同じ管理番号で発行し直すと、前のリンクは無効になります。</p>
      <form onSubmit={invite}>
        <fieldset className="buddy-finder-fields" disabled={busy}>
          <label>Buddy<select name="buddyId" required defaultValue=""><option value="" disabled>Buddyを選ぶ</option>
            {profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select></label>
          <label>利用の管理番号<input name="reference" required maxLength={100} /></label>
          <button className="vintage-primary" type="submit">投稿リンクを発行</button>
        </fieldset>
      </form>
      {link && <div className="user-voice-issued">
        <label>利用者に渡すURL<input readOnly value={link} onFocus={event => event.target.select()} /></label>
        <button type="button" onClick={async () => {
          try { await navigator.clipboard.writeText(link); setNotice("投稿リンクをコピーしました。"); }
          catch { setError("URL欄から手動でコピーしてください。"); }
        }}>コピー</button>
      </div>}
      <h2>口コミの掲載確認</h2>
      <label>表示する状態<select value={status} disabled={busy} onChange={event => { setStatus(event.target.value as Status); setPage(0); }}>
        {Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></label>
      {data && !data.reviews.length && <p>該当する口コミはありません。</p>}
      {data && <ul className="buddy-introduction-list">{data.reviews.map(review => <li key={review.id} id={"review-" + review.id} className="buddy-introduction">
        <strong>{profiles.find(profile => profile.id === review.buddyId)?.name ?? review.buddyId} · {review.rating} / 5</strong>
        <p>管理番号 {review.reference}</p>
        <p className="user-voice-body">{review.body}</p>
        <div className="user-voice-controls">
          {status === "pending" && <>
            <button disabled={busy} onClick={() => moderate(review.id, "approve", "口コミを掲載しました。")}>承認して掲載</button>
            <button disabled={busy} onClick={() => moderate(review.id, "reject", "掲載を見送りました。")}>掲載しない</button>
          </>}
          {status === "approved" && <button disabled={busy} onClick={() => moderate(review.id, "unpublish", "口コミを非公開にしました。")}>掲載を取り下げる</button>}
        </div>
      </li>)}</ul>}
      {data && (page > 0 || data.more) && <div className="user-voice-controls">
        <button disabled={!page || busy} onClick={() => setPage(page - 1)}>前へ</button>
        <button disabled={!data.more || busy} onClick={() => setPage(page + 1)}>次へ</button>
      </div>}
    </>}
    {notice && <p role="status">{notice}</p>}
    {error && <p role="alert" className="buddy-finder-error">{error}</p>}
    {!error && !authorized && <p role="status">権限を確認中…</p>}
  </>;
}
