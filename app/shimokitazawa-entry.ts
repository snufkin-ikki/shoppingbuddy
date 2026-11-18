export const vintageEntryPath = "/shimokitazawa/vintage";
export const vintageEntryId = "shimokitazawa-vintage";
export const sampleShopSource = "shop-demo";
export const vintageFilters = { area: "下北沢", category: "衣", query: "古着" };

export function entrySource(value: string | null) {
  return value && /^(?:shop|buddy)-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 64
    ? value
    : "direct";
}

export function vintageDemoHref(source: string, destination: string) {
  const query = new URLSearchParams({ entry: vintageEntryId, from: source });
  return `/?${query}#${destination}`;
}

const prefix = "shopping-buddy-vintage-v1:";
export const entrySteps = ["visit", "profile", "request", "slot", "saved"] as const;
type EntryStep = typeof entrySteps[number];

export function recordVintageStep(source: string, step: EntryStep) {
  try {
    const sessionKey = prefix + "session";
    let sessionId = sessionStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(sessionKey, sessionId);
    }
    localStorage.setItem(`${prefix}${source}:${sessionId}:${step}`, "1");
  } catch {
    // Browsing still works when storage is unavailable.
  }
}

export function currentVintageSource() {
  const query = new URLSearchParams(location.search);
  return query.get("entry") === vintageEntryId ? entrySource(query.get("from")) : null;
}

export function recordVintageDemoStep(step: EntryStep) {
  const source = currentVintageSource();
  if (!source) return;
  recordVintageStep(source, "visit");
  if (step !== "visit") recordVintageStep(source, step);
}

export function vintageEntryCounts() {
  const rows = new Map<string, Record<EntryStep, number>>();
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const [source, sessionId, step] = key.slice(prefix.length).split(":");
      if (!sessionId || !entrySteps.some(item => item === step)) continue;
      const row = rows.get(source) ?? { visit: 0, profile: 0, request: 0, slot: 0, saved: 0 };
      row[step as EntryStep]++;
      rows.set(source, row);
    }
  } catch {
    // Return counts already read if storage is unavailable.
  }
  return Array.from(rows, ([source, counts]) => ({ source, ...counts })).sort((a, b) => a.source.localeCompare(b.source));
}
