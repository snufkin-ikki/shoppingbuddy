import { maxAreaLength, maxDescriptionLength, normalizeBuddySearchBudget, normalizeLineContact } from "../app/buddy-search-request";

const maxBodyLength = 8192;
const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function reply(status: number, error?: string) {
  return Response.json(error ? { error } : { ok: true }, {
    status, headers: { "Cache-Control": "no-store" },
  });
}

export async function handleBuddySearchRequest(request: Request, db: D1Database) {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  if (request.headers.get("sec-fetch-site") === "cross-site") return reply(403, "送信できませんでした。");
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return reply(415, "入力内容を確認してください。");
  }
  if (Number(request.headers.get("content-length")) > maxBodyLength) return reply(413, "入力が長すぎます。");

  let data;
  try {
    const body = await request.text();
    if (body.length > maxBodyLength) return reply(413, "入力が長すぎます。");
    data = JSON.parse(body);
  } catch {
    return reply(400, "入力内容を確認してください。");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return reply(400, "入力内容を確認してください。");
  if (data.website) return reply(400, "入力内容を確認してください。");

  const id = data.id;
  const area = typeof data.area === "string" ? data.area.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const lineKind = data.lineKind;
  const budget = normalizeBuddySearchBudget(data.budget);
  // A cached form from before the budget field may still submit without it.
  if (data.budget !== undefined && budget === null) return reply(400, "ご予算の上限を確認してください。");
  if (typeof id !== "string" || !requestIdPattern.test(id) || !area || area.length > maxAreaLength
      || !description || description.length > maxDescriptionLength) {
    return reply(400, "エリアと探しているBuddyの希望を確認してください。");
  }
  if (lineKind !== "id" && lineKind !== "link") return reply(400, "折り返し先の種類を選んでください。");
  const lineContact = normalizeLineContact(lineKind, data.lineContact);
  if (!lineContact) return reply(400, "折り返し用のLINE IDまたはLINEプロフィールリンクを入力してください。");

  try {
    await db.prepare(`INSERT INTO buddy_search_requests
      (id, created_at_ms, area, description, line_kind, line_contact, budget_yen)
      VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`)
      .bind(id, Date.now(), area, description, lineKind, lineContact, budget).run();
    return reply(201);
  } catch {
    console.error("Buddy search request could not be saved");
    return reply(503, "受付できませんでした。時間をおいてもう一度お試しください。");
  }
}
