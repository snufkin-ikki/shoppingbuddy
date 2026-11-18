import { hasOperatorAccess } from "./operator-access";
import { profiles } from "../app/directory-data";

const day = 86_400_000;
const codePattern = /^[0-9a-f-]{36}$/i;
const buddyIds = new Set(profiles.map(profile => profile.id));
const namespace = "/api/user-voice";

function json(data: object, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function fail(error: string, status: number) {
  return json({ error }, status);
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function handleUserVoice(request: Request, db: D1Database, operatorEmail?: string) {
  const url = new URL(request.url);
  const operation = url.pathname.slice(namespace.length);
  const isOperator = operation === "/operations";
  if (isOperator && !hasOperatorAccess(request, operatorEmail)) {
    return fail("運営用のChatGPTアカウントでログインしてください。", 403);
  }

  try {
    if (request.method === "GET" && operation === "") {
      const buddy = url.searchParams.get("buddy") ?? "";
      if (!buddyIds.has(buddy)) return fail("Buddyが見つかりません。", 404);
      const offset = Number(url.searchParams.get("offset") ?? "0");
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > 10000) return fail("指定が無効です。", 400);
      const { results } = await db.prepare(
        "SELECT id, rating, body, published_at AS publishedAt, COUNT(*) OVER() AS total FROM user_voice WHERE buddy_id = ? AND status = 'approved' ORDER BY published_at DESC, id LIMIT 20 OFFSET ?",
      ).bind(buddy, offset).all<{ id: string; rating: number; body: string; publishedAt: number; total: number }>();
      return json({ count: results[0]?.total ?? 0, reviews: results.map(({ total, ...review }) => review) });
    }

    if (request.method === "GET" && isOperator) {
      const status = url.searchParams.get("status") ?? "pending";
      if (!["pending", "approved", "rejected"].includes(status)) return fail("指定が無効です。", 400);
      const page = Number(url.searchParams.get("page") ?? "0");
      if (!Number.isSafeInteger(page) || page < 0 || page > 500) return fail("指定が無効です。", 400);
      const focus = url.searchParams.get("focus") ?? "";
      const { results } = await db.prepare(
        "SELECT id, buddy_id AS buddyId, visit_reference AS reference, rating, body, status FROM user_voice WHERE status = ? ORDER BY id = ? DESC, submitted_at DESC, id LIMIT 21 OFFSET ?",
      ).bind(status, focus, page * 20).all();
      return json({ reviews: results.slice(0, 20), more: results.length > 20 });
    }

    if (request.method !== "POST" || (!isOperator && !["/submit", "/invite"].includes(operation))) return fail("ページが見つかりません。", 404);
    if (request.headers.get("origin") !== url.origin || request.headers.get("sec-fetch-site") === "cross-site") {
      return fail("この操作を受け付けられません。", 403);
    }
    if (Number(request.headers.get("content-length")) > 8192) return fail("入力が長すぎます。", 413);
    const input = await request.text();
    if (input.length > 8192) return fail("入力が長すぎます。", 413);
    let data;
    try { data = JSON.parse(input); } catch { return fail("入力内容を確認してください。", 400); }
    if (!data || typeof data !== "object" || Array.isArray(data)) return fail("入力内容を確認してください。", 400);

    if (operation === "/invite") {
      if (typeof data.code !== "string" || !codePattern.test(data.code)) return fail("投稿リンクを確認してください。", 404);
      const visit = await db.prepare(
        "SELECT buddy_id AS buddyId FROM user_voice WHERE invite_hash = ? AND status = 'invited' AND expires_at > ?",
      ).bind(await digest(data.code), Date.now()).first<{ buddyId: string }>();
      if (!visit || !buddyIds.has(visit.buddyId)) return fail("この投稿リンクは無効・期限切れ、または使用済みです。", 404);
      return json(visit);
    }

    if (!isOperator) {
      const { code, rating } = data;
      const body = typeof data.body === "string" ? data.body.trim() : "";
      if (typeof code !== "string" || !codePattern.test(code) || !Number.isInteger(rating) || rating < 1 || rating > 5 || !body || body.length > 600) {
        return fail("投稿リンク・評価・口コミの入力内容を確認してください。", 400);
      }
      const result = await db.prepare(
        "UPDATE user_voice SET status = 'pending', rating = ?, body = ?, submitted_at = ? WHERE invite_hash = ? AND status = 'invited' AND expires_at > ?",
      ).bind(rating, body, Date.now(), await digest(code), Date.now()).run();
      if (result.meta.changes !== 1) return fail("この投稿リンクは無効・期限切れ、または使用済みです。", 409);
      return json({ ok: true }, 201);
    }

    if (data.action === "invite") {
      const reference = typeof data.reference === "string" ? data.reference.trim() : "";
      if (!buddyIds.has(data.buddyId) || !reference || reference.length > 100) return fail("Buddyと利用の管理番号を確認してください。", 400);
      const code = crypto.randomUUID();
      const result = await db.prepare(
        "INSERT INTO user_voice (id, visit_reference, buddy_id, invite_hash, expires_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(visit_reference) DO UPDATE SET invite_hash = excluded.invite_hash, expires_at = excluded.expires_at WHERE user_voice.status = 'invited' AND user_voice.buddy_id = excluded.buddy_id",
      ).bind(crypto.randomUUID(), reference, data.buddyId, await digest(code), Date.now() + 30 * day).run();
      if (result.meta.changes !== 1) return fail("この管理番号は投稿済みか、別のBuddyに紐づいています。", 409);
      return json({ path: "/user-voice#" + code }, 201);
    }

    const { id, action } = data;
    if (typeof id !== "string" || !codePattern.test(id) || !["approve", "reject", "unpublish"].includes(action)) {
      return fail("操作内容を確認してください。", 400);
    }
    const from = action === "unpublish" ? "approved" : "pending";
    const to = action === "approve" ? "approved" : "rejected";
    const result = await db.prepare(
      "UPDATE user_voice SET status = ?, published_at = ? WHERE id = ? AND status = ?",
    ).bind(to, to === "approved" ? Date.now() : null, id, from).run();
    return result.meta.changes === 1 ? json({ ok: true }) : fail("口コミの状態が変わりました。一覧を更新してください。", 409);
  } catch {
    return fail("処理できませんでした。時間をおいてお試しください。", 503);
  }
}
