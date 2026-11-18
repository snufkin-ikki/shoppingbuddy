import type { SiteLanguage } from "./site-language";

export const maxAreaLength = 80;
export const maxDescriptionLength = 600;
export const maxLineContactLength = 300;

export function buddySearchRequestHref(area: string, plan?: { duration: "60"; maxFee: number; tags: string[] }, language: SiteLanguage = "ja") {
  const params = new URLSearchParams();
  if (language !== "ja") params.set("lang", language);
  const name = area.trim();
  if (name && name !== "未設定") params.set("area", name);
  if (plan) {
    params.set("duration", plan.duration);
    params.set("budget", String(plan.maxFee));
    params.set("interests", plan.tags.join("・"));
  }
  return params.size ? "/find-a-buddy?" + params : "/find-a-buddy";
}

export function normalizeLineContact(kind: unknown, value: unknown) {
  if (typeof value !== "string") return null;
  const contact = value.trim();
  if (!contact || contact.length > maxLineContactLength) return null;
  if (kind === "id") return /^@?[a-z0-9._-]{1,64}$/i.test(contact) ? contact : null;
  if (kind !== "link") return null;
  try {
    const url = new URL(contact);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const isLineProfile = url.hostname === "line.me" && /^\/(?:R\/)?ti\/p\/[^/]+\/?$/i.test(url.pathname);
    const isLineShortLink = url.hostname === "lin.ee" && /^\/[a-z0-9]+\/?$/i.test(url.pathname);
    return isLineProfile || isLineShortLink ? url.href : null;
  } catch {
    return null;
  }
}
