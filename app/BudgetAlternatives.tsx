"use client";

import { useState } from "react";
import { buddySearchRequestHref } from "./buddy-search-request";
import { type BuddyProfile, lowerPriceBuddies, minimumRespectFeeBeforeTax, respectFeeWithTax } from "./directory-data";

const labels = {
  ja: { trigger: "もう少し予算を抑えて探す", area: "街", all: "すべてのエリア", widen: "ほかのエリアも見る", none: "この条件で、リスペクトフィーがより低いBuddyはまだいません。", ask: "見つかったらLINEで教えて", price: "より低いリスペクトフィー", cap: "未満", unit: "30分（税抜）" },
  en: { trigger: "Look for lower-priced buddies", area: "Area", all: "All areas", widen: "Include other areas", none: "No lower-priced buddies match these conditions yet.", ask: "Ask for a LINE follow-up", price: "Lower respect fees", cap: " max (exclusive)", unit: "30 min (excl. tax)" },
  zh: { trigger: "寻找费用更低的同伴", area: "区域", all: "全部区域", widen: "查看其他区域", none: "暂无符合条件且费用更低的同伴。", ask: "找到后通过 LINE 通知我", price: "更低的公示费用", cap: "以下（不含）", unit: "30分钟（未税）" },
};

export default function BudgetAlternatives({ profile, area, locale, onSelect }: {
  profile: BuddyProfile;
  area: string;
  locale: keyof typeof labels;
  onSelect: (id: string) => void;
}) {
  const fee = profile.fee;
  const [chosenArea, setChosenArea] = useState<string>();
  const activeArea = chosenArea ?? (profile.areas.some(place => place === area) ? area : profile.areas[0] ?? "");
  const copy = labels[locale];
  if (fee <= minimumRespectFeeBeforeTax) return null;
  const results = lowerPriceBuddies(profile, activeArea);

  return <details className="budget-alternatives">
    <summary>{copy.trigger}</summary>
    <p>{copy.price} · {copy.unit} / ¥{(fee / 2).toLocaleString("ja-JP")}{copy.cap}</p>
    <div className="budget-alternative-fields">
    <label>{copy.area}
      <select value={activeArea} onChange={event => setChosenArea(event.target.value)}>
        <option value="">{copy.all}</option>
        {profile.areas.map(place => <option key={place}>{place}</option>)}
      </select>
    </label>
    </div>
    <div aria-live="polite">
      {results.length > 0 ? <ul>
        {results.map(({ profile: candidate, fee: candidateFee, sharedTags }) => <li key={candidate.id}>
          <button type="button" onClick={() => onSelect(candidate.id)}>
            <span><strong>{candidate.name}</strong><small>{[activeArea || candidate.areas[0], ...sharedTags.slice(0, 2)].filter(Boolean).join(" · ")}</small></span>
            <strong>¥{(candidateFee / 2).toLocaleString("ja-JP")}</strong>
          </button>
        </li>)}
      </ul> : <p>{copy.none}</p>}
    </div>
    {results.length === 0 && <div className="budget-alternative-actions">
      {activeArea && <button type="button" onClick={() => setChosenArea("")}>{copy.widen}</button>}
      <a href={buddySearchRequestHref(activeArea, { duration: "60", maxFee: respectFeeWithTax(fee) - 1, tags: profile.tags.slice(0, 2) }, locale)}>{copy.ask} →</a>
    </div>}
  </details>;
}
