import { hasOperatorAccess } from "./operator-access";

function reply(data: object, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function handleOperationsQueue(request: Request, db: D1Database, operatorEmail?: string) {
  if (!hasOperatorAccess(request, operatorEmail)) return reply({ error: "運営用アカウントでログインしてください。" }, 403);
  const url = new URL(request.url);
  try {
    if (request.method === "GET") {
      const page = Number(url.searchParams.get("page") ?? "0");
      if (!Number.isSafeInteger(page) || page < 0 || page > 500) return reply({ error: "指定が無効です。" }, 400);
      const { results } = await db.prepare(`
        SELECT id, 'line' AS kind, created_at_ms AS receivedAt, area, description, line_kind AS lineKind, line_contact AS lineContact, budget_yen AS budget
          FROM buddy_search_requests WHERE contacted_at_ms IS NULL
        UNION ALL
        SELECT id, 'review', submitted_at, buddy_id, NULL, NULL, NULL, NULL
          FROM user_voice WHERE status = 'pending'
        UNION ALL
        SELECT id, 'introduction', submitted_at, target_id, author_id, NULL, NULL, NULL
          FROM buddy_peer_introductions WHERE status = 'pending'
        ORDER BY receivedAt, id LIMIT 21 OFFSET ?
      `).bind(page * 20).all();
      return reply({ items: results.slice(0, 20), more: results.length > 20 });
    }

    if (request.method !== "POST") return reply({ error: "操作を受け付けられません。" }, 405);
    if (request.headers.get("origin") !== url.origin || request.headers.get("sec-fetch-site") === "cross-site") {
      return reply({ error: "この操作を受け付けられません。" }, 403);
    }
    if (Number(request.headers.get("content-length")) > 8192) return reply({ error: "入力が長すぎます。" }, 413);
    const body = await request.text();
    if (body.length > 8192) return reply({ error: "入力が長すぎます。" }, 413);
    let data: { id?: unknown } | null;
    try { data = JSON.parse(body); } catch { data = null; }
    if (typeof data?.id !== "string" || !/^[0-9a-f-]{36}$/i.test(data.id)) {
      return reply({ error: "依頼番号を確認してください。" }, 400);
    }
    const result = await db.prepare("UPDATE buddy_search_requests SET contacted_at_ms = ? WHERE id = ? AND contacted_at_ms IS NULL")
      .bind(Date.now(), data.id).run();
    return result.meta.changes ? reply({ ok: true }) : reply({ error: "依頼はすでに更新されています。一覧を更新してください。" }, 409);
  } catch {
    return reply({ error: "処理できませんでした。時間をおいてお試しください。" }, 503);
  }
}
