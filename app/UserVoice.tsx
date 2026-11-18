"use client";

import { useEffect, useState } from "react";

type Review = { id: string; rating: number; body: string };
const copy = {
  ja: { count: "件", empty: "まだ口コミはありません。", loading: "口コミを読み込み中…", error: "口コミを読み込めませんでした。", retry: "再試行", more: "次の口コミ", prev: "前の口コミ", rating: "評価" },
  en: { count: " reviews", empty: "No reviews yet.", loading: "Loading reviews…", error: "Reviews could not be loaded.", retry: "Try again", more: "Next reviews", prev: "Previous reviews", rating: "Rating" },
  zh: { count: " 条评价", empty: "暂无评价。", loading: "正在加载评价…", error: "无法加载评价。", retry: "重试", more: "下一页评价", prev: "上一页评价", rating: "评分" },
};

export default function UserVoice({ buddyId, locale }: { buddyId: string; locale: keyof typeof copy }) {
  const [data, setData] = useState<{ count: number; reviews: Review[] } | null>(null);
  const [error, setError] = useState(false);
  const [offset, setOffset] = useState(0);
  const [retry, setRetry] = useState(0);
  const labels = copy[locale];

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError(false);
    const query = new URLSearchParams({ buddy: buddyId, offset: String(offset) });
    fetch("/api/user-voice?" + query, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(result => {
        if (offset > 0 && !result.reviews.length) setOffset(Math.max(0, offset - 20));
        else setData(result);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [buddyId, offset, retry]);

  return <section className="buddy-introductions user-voice" aria-labelledby="user-voice-title">
    <h3 id="user-voice-title">User Voice {data && <small>{data.count}{labels.count}</small>}</h3>
    <p role="status">{error ? labels.error : !data ? labels.loading : !data.count ? labels.empty : ""}</p>
    {error && <button type="button" onClick={() => setRetry(value => value + 1)}>{labels.retry}</button>}
    {Boolean(data?.reviews.length) && <ul className="buddy-introduction-list">
      {data?.reviews.map(review => <li className="buddy-introduction" key={review.id}>
        <strong>{labels.rating} {review.rating} / 5</strong>
        <p className="user-voice-body">{review.body}</p>
      </li>)}
    </ul>}
    {data && (offset > 0 || data.count > offset + 20) && <div className="user-voice-controls">
      <button type="button" disabled={!offset} onClick={() => setOffset(offset - 20)}>{labels.prev}</button>
      <button type="button" disabled={data.count <= offset + 20} onClick={() => setOffset(offset + 20)}>{labels.more}</button>
    </div>}
  </section>;
}
