import { buddyIntroductions } from "../app/buddy-introductions";
import { normalizeLineContact } from "../app/buddy-search-request";
import { profiles } from "../app/directory-data";
import { hasOperatorAccess } from "./operator-access";

const buddyIds = new Set(profiles.map(profile => profile.id));
const inviteLifetime = 30 * 24 * 60 * 60 * 1000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(data: object, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function error(message: string, status = 400) {
  return json({ error: message }, status);
}

function field(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length <= max ? value.trim() : "";
}

function mediaLink(value: unknown) {
  try {
    const url = new URL(field(value, 1000));
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

export async function handleBuddyNetwork(request: Request, db: D1Database, operatorEmail?: string) {
  const url = new URL(request.url);
  const route = url.pathname.replace("/api/buddy-network", "");
  const email = request.headers.get("oai-authenticated-user-id")
    ? request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() : undefined;
  const operator = hasOperatorAccess(request, operatorEmail);
  const cutoff = Date.now() - inviteLifetime;

  try {
    if (request.method === "GET" && route === "/public") {
      const buddy = url.searchParams.get("buddy");
      if (!buddy || !buddyIds.has(buddy)) return error("Buddyが見つかりません。", 404);
      const [written, invited] = await db.batch([
        db.prepare(`SELECT author_id AS authorId, target_id AS targetId, strengths, experience, good_for AS goodFor
          FROM buddy_peer_introductions WHERE status = 'approved' AND (author_id = ? OR target_id = ?) ORDER BY submitted_at DESC`).bind(buddy, buddy),
        db.prepare(`SELECT author_id AS authorId, target_id AS targetId FROM buddy_referrals
          WHERE status = 'joined' AND (author_id = ? OR target_id = ?)`).bind(buddy, buddy),
      ]);
      return json({ introductions: written.results, connections: invited.results });
    }

    if (request.method === "GET" && route === "/invite") {
      const code = url.searchParams.get("code") ?? "";
      if (!uuid.test(code)) return error("招待リンクを確認してください。", 404);
      const invite = await db.prepare(`SELECT author_id AS authorId FROM buddy_referrals
        WHERE code = ? AND status = 'issued' AND created_at > ?`).bind(code, cutoff).first<{ authorId: string }>();
      if (!invite || !buddyIds.has(invite.authorId)) return error("この招待リンクは期限切れか、すでに使われています。", 404);
      return json(invite);
    }

    if (request.method !== "GET" && request.method !== "POST") return error("ページが見つかりません。", 404);
    const member = email && (route === "/member" || route === "/operations")
      ? await db.prepare("SELECT buddy_id AS buddyId FROM buddy_member_access WHERE email = ?").bind(email).first<{ buddyId: string }>()
      : null;
    const author = member && buddyIds.has(member.buddyId) ? member.buddyId : "";
    if (route === "/member" && !author) return error("運営に登録済みのBuddyアカウントでログインしてください。", 403);
    if (route === "/operations" && !operator) return error("運営用アカウントでログインしてください。", 403);
    if (request.method === "GET" && route === "/member") {
      const { results } = await db.prepare("SELECT code, status FROM buddy_referrals WHERE author_id = ? AND (status <> 'issued' OR created_at > ?) ORDER BY created_at DESC LIMIT 50").bind(author, cutoff).all();
      return json({ buddyId: author, invites: results });
    }
    if (request.method === "GET" && route === "/operations") {
      const [introductions, referrals, members] = await db.batch([
        db.prepare(`SELECT id, author_id AS authorId, target_id AS targetId, strengths, experience, good_for AS goodFor, status
          FROM buddy_peer_introductions WHERE status IN ('pending', 'approved') ORDER BY id = ? DESC, status = 'pending' DESC, submitted_at DESC LIMIT 100`).bind(url.searchParams.get("focus") ?? ""),
        db.prepare(`SELECT code, author_id AS authorId, target_id AS targetId, name, area, interest, media_url AS mediaUrl,
          line_kind AS lineKind, line_contact AS lineContact, status FROM buddy_referrals
          WHERE status IN ('pending', 'joined') ORDER BY status = 'pending' DESC, submitted_at DESC LIMIT 100`),
        db.prepare("SELECT buddy_id AS buddyId, email FROM buddy_member_access ORDER BY buddy_id"),
      ]);
      return json({ introductions: introductions.results, referrals: referrals.results, members: members.results });
    }

    if (request.method !== "POST" || !["/member", "/operations", "/invite"].includes(route)) {
      return error("ページが見つかりません。", 404);
    }
    if (request.headers.get("origin") !== url.origin || request.headers.get("sec-fetch-site") === "cross-site") {
      return error("この操作を受け付けられません。", 403);
    }
    if (Number(request.headers.get("content-length")) > 8192) return error("入力が長すぎます。", 413);
    const raw = await request.text();
    if (raw.length > 8192) return error("入力が長すぎます。", 413);
    let input;
    try { input = JSON.parse(raw); } catch { return error("入力内容を確認してください。"); }
    if (!input || typeof input !== "object" || Array.isArray(input)) return error("入力内容を確認してください。");

    if (route === "/member") {
      if (input.action === "invite") {
        const code = crypto.randomUUID();
        const result = await db.prepare(`INSERT INTO buddy_referrals (code, author_id, created_at, status)
          SELECT ?, ?, ?, 'issued' WHERE (SELECT count(*) FROM buddy_referrals
          WHERE author_id = ? AND created_at > ?) < 30`).bind(code, author, Date.now(), author, cutoff).run();
        return result.meta.changes === 1 ? json({ code }, 201) : error("この30日間の発行上限に達しました。", 429);
      }
      const { targetId } = input;
      const strengths = field(input.strengths, 400);
      const experience = field(input.experience, 400);
      const goodFor = field(input.goodFor, 400);
      if (input.action !== "introduce" || !buddyIds.has(targetId) || targetId === author || !strengths || !experience || !goodFor) {
        return error("紹介するBuddyと紹介文の3項目を確認してください。");
      }
      if (buddyIntroductions[targetId]?.some(entry => entry.authorId === author)) {
        return error("このBuddyへの紹介はすでに掲載されています。", 409);
      }
      const result = await db.prepare(`INSERT INTO buddy_peer_introductions
        (id, author_id, target_id, strengths, experience, good_for, status, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
        ON CONFLICT(author_id, target_id) DO UPDATE SET strengths = excluded.strengths,
        experience = excluded.experience, good_for = excluded.good_for, status = 'pending',
        submitted_at = excluded.submitted_at WHERE buddy_peer_introductions.status = 'rejected'`)
        .bind(crypto.randomUUID(), author, targetId, strengths, experience, goodFor, Date.now()).run();
      return result.meta.changes === 1 ? json({ ok: true }, 201) : error("このBuddyへの紹介はすでに確認中か掲載済みです。", 409);
    }

    if (route === "/invite") {
      const code = field(input.code, 36);
      const name = field(input.name, 80);
      const area = field(input.area, 80);
      const interest = field(input.interest, 400);
      const media = mediaLink(input.mediaUrl);
      const line = normalizeLineContact(input.lineKind, input.lineContact);
      if (!uuid.test(code) || !name || !area || !interest || !media || !line || input.consent !== true) {
        return error("プロフィール、取材記事・動画のURL、LINE連絡先、同意を確認してください。");
      }
      const result = await db.prepare(`UPDATE buddy_referrals SET name = ?, area = ?, interest = ?, media_url = ?,
        line_kind = ?, line_contact = ?, status = 'pending', submitted_at = ?
        WHERE code = ? AND status = 'issued' AND created_at > ?`)
        .bind(name, area, interest, media, input.lineKind, line, Date.now(), code, cutoff).run();
      return result.meta.changes === 1 ? json({ ok: true }, 201) : error("この招待リンクは期限切れか、すでに使われています。", 409);
    }

    if (input.action === "grant" || input.action === "revoke") {
      if (!buddyIds.has(input.buddyId)) return error("Buddyを選んでください。");
      if (input.action === "revoke") {
        await db.prepare("DELETE FROM buddy_member_access WHERE buddy_id = ?").bind(input.buddyId).run();
      } else {
        const memberEmail = field(input.email, 254).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)) return error("ログイン用メールアドレスを確認してください。");
        const result = await db.prepare(`INSERT INTO buddy_member_access (buddy_id, email)
          SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM buddy_member_access WHERE email = ? AND buddy_id <> ?)
          ON CONFLICT(buddy_id) DO UPDATE SET email = excluded.email`).bind(input.buddyId, memberEmail, memberEmail, input.buddyId).run();
        if (!result.meta.changes) return error("このアカウントは別のBuddyに割り当て済みです。", 409);
      }
      return json({ ok: true });
    }

    if (["approve", "reject", "unpublish"].includes(input.action) && uuid.test(field(input.id, 36))) {
      const from = input.action === "unpublish" ? "approved" : "pending";
      const to = input.action === "approve" ? "approved" : "rejected";
      const result = await db.prepare("UPDATE buddy_peer_introductions SET status = ? WHERE id = ? AND status = ?")
        .bind(to, input.id, from).run();
      return result.meta.changes === 1 ? json({ ok: true }) : error("紹介文の状態が変わりました。一覧を更新してください。", 409);
    }

    if (["join", "decline", "unlink"].includes(input.action) && uuid.test(field(input.code, 36))) {
      if (input.action === "join" && !buddyIds.has(input.targetId)) return error("掲載済みのBuddyを選んでください。");
      const statement = input.action === "join"
        ? db.prepare(`UPDATE buddy_referrals SET status = 'joined', target_id = ?
            WHERE code = ? AND status = 'pending' AND author_id <> ?
            AND NOT EXISTS (SELECT 1 FROM buddy_referrals WHERE target_id = ? AND status = 'joined')`).bind(input.targetId, input.code, input.targetId, input.targetId)
        : db.prepare("UPDATE buddy_referrals SET status = ?, target_id = NULL WHERE code = ? AND status = ?")
            .bind(input.action === "unlink" ? "pending" : "declined", input.code, input.action === "unlink" ? "joined" : "pending");
      const result = await statement.run();
      return result.meta.changes === 1 ? json({ ok: true }) : error("申込みの状態か、選択したBuddyの紐づけを確認してください。", 409);
    }
    return error("操作内容を確認してください。");
  } catch {
    return error("処理できませんでした。時間をおいてお試しください。", 503);
  }
}
