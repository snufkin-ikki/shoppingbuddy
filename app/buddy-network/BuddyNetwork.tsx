"use client";

import { useEffect, useState, type FormEvent } from "react";
import { profiles } from "../directory-data";

type Mode = "member" | "invite" | "operations";
type Introduction = {
  id: string; authorId: string; targetId: string; strengths: string;
  experience: string; goodFor: string; status: string;
};
type Referral = {
  code: string; authorId: string; targetId: string | null; name: string; area: string;
  interest: string; mediaUrl: string; lineKind: string; lineContact: string; status: string;
};
type Membership = { buddyId: string; email: string };
type MemberData = { buddyId: string; invites: Pick<Referral, "code" | "status">[] };
type OperationsData = { introductions: Introduction[]; referrals: Referral[]; members: Membership[] };

const statusLabels: Record<string, string> = {
  issued: "回答待ち", pending: "運営確認中", joined: "参加済み", declined: "受付終了",
};
const buddyName = (id?: string | null) => profiles.find(profile => profile.id === id)?.name ?? "Buddy";

async function network<T>(route: string, payload?: object): Promise<T> {
  const response = await fetch("/api/buddy-network/" + route, payload && {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "処理できませんでした。");
  return data;
}

function BuddySelect({ name = "buddyId", initial, omit, label = "Buddy" }: {
  name?: string; initial?: string; omit?: string; label?: string;
}) {
  return <label>{label}<select name={name} required defaultValue={initial ?? ""}>
    <option value="" disabled>選んでください</option>
    {profiles.filter(profile => profile.id !== omit).map(profile =>
      <option value={profile.id} key={profile.id}>{profile.name}</option>)}
  </select></label>;
}

export default function BuddyNetwork({ mode, initialBuddy }: { mode: Mode; initialBuddy?: string }) {
  const [member, setMember] = useState<MemberData>();
  const [operations, setOperations] = useState<OperationsData>();
  const [invite, setInvite] = useState<{ code: string; authorId: string }>();
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);
  const [latestCode, setLatestCode] = useState("");

  async function refresh() {
    if (mode === "member") setMember(await network<MemberData>("member"));
    if (mode === "operations") {
      const focus = location.hash.startsWith("#intro-") ? location.hash.slice(7) : "";
      setOperations(await network<OperationsData>("operations?" + new URLSearchParams({ focus })));
    }
    if (mode === "invite") {
      const code = window.location.hash.slice(1);
      const data = await network<{ authorId: string }>("invite?" + new URLSearchParams({ code }));
      setInvite({ code, ...data });
    }
  }

  useEffect(() => {
    refresh().catch(error => setFailure(error.message));
    // The mode belongs to the current document URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (operations && location.hash.startsWith("#intro-")) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "center" });
    }
  }, [operations]);

  async function submit(event: FormEvent<HTMLFormElement>, action: string, extra: object = {}, confirmation = "") {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setFailure("");
    setMessage("");
    setWorking(true);
    try {
      const result = await network<{ code?: string }>(mode, {
        ...Object.fromEntries(values), action, ...extra,
      });
      if (result.code) setLatestCode(result.code);
      if (mode === "invite") setDone(true);
      if (action === "introduce" || action === "grant") form.reset();
      setMessage(confirmation);
      if (mode !== "invite") await refresh();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "処理できませんでした。");
    } finally {
      setWorking(false);
    }
  }

  async function copyInvite(code: string) {
    try {
      await navigator.clipboard.writeText(inviteLink(code));
      setMessage("招待リンクをコピーしました。");
      setFailure("");
    } catch {
      setMessage("");
      setFailure("リンク欄からURLをコピーしてください。");
    }
  }

  function inviteLink(code: string) {
    return new URL("/buddy-network?invite=1#" + code, window.location.origin).href;
  }

  if (done) return <div className="buddy-finder-receipt">
    <h2>参加希望を受け付けました</h2>
    <p>運営が内容を確認し、入力いただいたLINEにご連絡します。</p>
    <a href="/#directory">Buddy一覧を見る</a>
  </div>;

  return <div className="buddy-network-content">
    {message && <p className="buddy-finder-receipt" role="status">{message}</p>}
    {failure && <p className="buddy-finder-error" role="alert">{failure}</p>}
    {!member && !operations && !invite && !failure && <p role="status">読み込み中…</p>}
    {member && <>
      <p><a className="buddy-network-link" href={"/#" + member.buddyId}>{buddyName(member.buddyId)}のプロフィール</a>でログイン中</p>
      {initialBuddy !== member.buddyId && <form onSubmit={event => submit(event, "introduce", {}, "紹介文を受け付けました。運営の確認後に掲載されます。")}>
        <fieldset className="buddy-finder-fields" disabled={working}>
          <legend>登録済みの知り合いを紹介する</legend>
          <BuddySelect name="targetId" initial={initialBuddy} omit={member.buddyId} label="紹介するBuddy" />
          <label>このBuddyの魅力<textarea name="strengths" rows={3} maxLength={400} required /></label>
          <label>一緒に歩くと楽しめること<textarea name="experience" rows={3} maxLength={400} required /></label>
          <label>こんな人におすすめ<textarea name="goodFor" rows={3} maxLength={400} required /></label>
          <button className="buddy-finder-link">紹介文を運営に送る</button>
        </fieldset>
      </form>}
      <form onSubmit={event => submit(event, "invite", {}, "招待リンクを作りました。LINEなどで本人に渡してください。")}>
        <fieldset className="buddy-finder-fields" disabled={working}>
          <legend>新しいBuddyを招待する</legend>
          <p>一緒に街を歩いたら面白そうな知り合いに、LINEなどでリンクを渡せます。リンクは発行から30日間、1回だけ使えます。</p>
          <button className="buddy-finder-link">招待リンクを作る</button>
        </fieldset>
      </form>
      {member.invites.length > 0 && <section aria-label="招待の状況">
        <h2>招待の状況</h2>
        <ul className="buddy-introduction-list">{member.invites.map(({ code, status }) =>
          <li className="buddy-introduction" key={code}>
            <strong>{latestCode === code ? "新しい招待 · " : ""}{statusLabels[status]}</strong>
            {status === "issued" && <div className="buddy-network-share">
              <input aria-label="招待リンク" readOnly value={inviteLink(code)} onFocus={event => event.currentTarget.select()} />
              <button type="button" onClick={() => copyInvite(code)}>コピー</button>
              <a href={"https://social-plugins.line.me/lineit/share?url=" + encodeURIComponent(inviteLink(code))} target="_blank" rel="noopener noreferrer">LINEで送る</a>
            </div>}
          </li>)}</ul>
      </section>}
    </>}
    {invite && <form onSubmit={event => submit(event, "apply", {
      code: invite.code, consent: new FormData(event.currentTarget).get("consent") === "on",
    })}>
      <fieldset className="buddy-finder-fields" disabled={working}>
        <legend>{buddyName(invite.authorId)}さんからの招待</legend>
        <p>好きな街や詳しいジャンルを教えてください。参加には運営による確認があります。</p>
        <label>名前・活動名<input name="name" autoComplete="name" maxLength={80} required /></label>
        <label>案内できる街<input name="area" placeholder="例　下北沢" maxLength={80} required /></label>
        <label>好きなこと・一緒に案内できること<textarea name="interest" rows={3} maxLength={400} required /></label>
        <label>ご自身の取材記事・出演動画のURL<input name="mediaUrl" type="url" maxLength={1000} required /></label>
        <label>折り返し方法<select name="lineKind"><option value="id">LINE ID</option><option value="link">LINEプロフィールリンク</option></select></label>
        <label>ご自身のLINE連絡先<input name="lineContact" maxLength={300} required /></label>
        <label className="buddy-network-consent"><input type="checkbox" name="consent" required />
          <span>応募内容とLINE連絡先を運営に送ること、参加してプロフィールが公開された際に紹介元のBuddyがプロフィールに表示されることに同意します。</span>
        </label>
        <button className="buddy-finder-link">参加希望を送る</button>
      </fieldset>
    </form>}
    {operations && <>
      <p><a href="/operations">運営の対応待ち一覧へ</a></p>
      <form onSubmit={event => {
        const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        submit(event, button?.value ?? "grant", {}, "Buddyのアクセス権を更新しました。");
      }}>
        <fieldset className="buddy-finder-fields" disabled={working}>
          <legend>Buddyのアクセス権</legend>
          <BuddySelect />
          <label>Buddyがログインに使うメールアドレス<input name="email" type="email" maxLength={254} required /></label>
          <div className="user-voice-controls">
            <button value="grant">登録・更新する</button>
            <button value="revoke" formNoValidate>アクセスを解除</button>
          </div>
        </fieldset>
      </form>
      {operations.members.length > 0 && <ul>{operations.members.map(item =>
        <li key={item.buddyId}>{buddyName(item.buddyId)} · {item.email}</li>)}</ul>}
      <section>
        <h2>他己紹介</h2>
        {!operations.introductions.length && <p>確認する紹介文はありません。</p>}
        <ul className="buddy-introduction-list">{operations.introductions.map(item =>
          <li className="buddy-introduction" key={item.id} id={"intro-" + item.id}>
            <strong>{buddyName(item.authorId)} → {buddyName(item.targetId)}</strong>
            <dl><div><dt>魅力</dt><dd>{item.strengths}</dd></div><div><dt>楽しめること</dt><dd>{item.experience}</dd></div><div><dt>おすすめ</dt><dd>{item.goodFor}</dd></div></dl>
            <form className="user-voice-controls" onSubmit={event => {
              const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
              submit(event, button?.value ?? "approve", { id: item.id }, "紹介文を更新しました。");
            }}>
              {item.status === "pending" ? <>
                <button disabled={working} value="approve">承認して掲載</button>
                <button disabled={working} value="reject">差し戻す</button>
              </> : <button disabled={working} value="unpublish">掲載を取り下げる</button>}
            </form>
          </li>)}</ul>
      </section>
      <section>
        <h2>招待経由の参加希望</h2>
        {!operations.referrals.length && <p>確認する参加希望はありません。</p>}
        <ul className="buddy-introduction-list">{operations.referrals.map(item =>
          <li className="buddy-introduction" key={item.code}>
            <strong>{item.name} · {item.area}</strong>
            <p>招待したBuddy　{buddyName(item.authorId)}</p>
            <p>{item.interest}</p>
            <p><a className="buddy-network-link" href={item.mediaUrl} target="_blank" rel="noopener noreferrer">取材記事・動画を確認</a></p>
            <p className="buddy-network-contact">LINE　{item.lineContact}</p>
            <form onSubmit={event => {
              const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
              submit(event, button?.value ?? "join", { code: item.code }, "参加希望の状態を更新しました。");
            }}>
              <fieldset className="buddy-finder-fields" disabled={working}>
                {item.status === "pending" ? <>
                  <BuddySelect name="targetId" omit={item.authorId} label="参加確定後に紐づける公開プロフィール" />
                  <div className="user-voice-controls"><button value="join">紐づけを公開</button><button value="decline" formNoValidate>受付を終了</button></div>
                </> : <>
                  <p>紐づけ先　{buddyName(item.targetId)}</p>
                  <div className="user-voice-controls"><button value="unlink">紐づけを取り下げる</button></div>
                </>}
              </fieldset>
            </form>
          </li>)}</ul>
      </section>
    </>}
  </div>;
}
