"use client";

import { profiles } from "../directory-data";
import { useEffect, useRef, useState, type FormEvent } from "react";

export default function ReviewPage() {
  const code = useRef("");
  const [ready, setReady] = useState(false);
  const [buddyName, setBuddyName] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [writing, setWriting] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    code.current = location.hash.slice(1);
    if (!/^[0-9a-f-]{36}$/i.test(code.current)) {
      setReady(true);
      return;
    }
    const controller = new AbortController();
    fetch("/api/user-voice/invite", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.current }), signal: controller.signal,
    }).then(async response => {
      const result = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) setInviteError(result.error);
      else setBuddyName(profiles.find(profile => profile.id === result.buddyId)?.name ?? "");
      setReady(true);
    }).catch(() => {
      if (!controller.signal.aborted) {
        setInviteError("通信を確認して、投稿リンクを開き直してください。");
        setReady(true);
      }
    });
    return () => controller.abort();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/user-voice/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.current, rating: Number(form.get("rating")), body: form.get("body") }),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      history.replaceState(null, "", location.pathname);
      setSent(true);
    } catch {
      setError("通信を確認して、もう一度お試しください。");
    } finally {
      setPending(false);
    }
  }

  return <main lang="ja" className="vintage-entry buddy-finder">
    <section className="buddy-finder-panel">
      <h1>{buddyName && !sent ? "今日の街歩きはいかがでしたか？" : "街歩きの口コミを書く"}</h1>
      {sent ? <p role="status">口コミを受け付けました。運営が確認し、承認された口コミをBuddyのプロフィールに掲載します。</p>
        : !ready ? <p role="status">投稿リンクを確認中…</p>
        : inviteError ? <p role="alert">{inviteError}</p>
        : buddyName ? <>
          <p className="buddy-finder-lead">{buddyName}さんとの街歩き</p>
          {!writing ? <div className="user-voice-controls">
            <button className="vintage-primary" type="button" onClick={() => setWriting(true)}>口コミを書く</button>
            <a href="/#directory">あとで書く</a>
          </div> : <>
          <p className="buddy-finder-lead">Buddyのどんな話や視点が印象に残りましたか？ 次に一緒に歩く人におすすめしたいことを教えてください。</p>
          <form className="buddy-finder-form" onSubmit={submit}>
            <fieldset className="buddy-finder-fields" disabled={pending}>
              <label>街歩きの評価<select name="rating" required autoFocus defaultValue=""><option value="" disabled>評価を選ぶ</option>
                {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} / 5</option>)}
              </select></label>
              <label>口コミ<textarea name="body" required maxLength={600} rows={5} /></label>
              <p>運営が承認した口コミは、Buddyのプロフィールに匿名で掲載されます。氏名や連絡先は本文に入れないでください。</p>
              <label className="user-voice-public-consent"><input type="checkbox" required /> 匿名での公開に同意する</label>
              {error && <p role="alert" className="buddy-finder-error">{error}</p>}
              <button className="vintage-primary" type="submit">{pending ? "送信中…" : "口コミを送る"}</button>
            </fieldset>
          </form>
          </>}
        </> : <p className="buddy-finder-lead">利用後に運営から受け取った投稿リンクを開いてください。</p>}
      {(!buddyName || writing || sent) && <a className="user-voice-return" href="/#directory">Buddy一覧に戻る</a>}
    </section>
  </main>;
}
