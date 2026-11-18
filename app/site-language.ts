export type SiteLanguage = "ja" | "en" | "zh";

export function siteLanguage(value: unknown): SiteLanguage {
  return value === "en" || value === "zh" ? value : "ja";
}

export function homeHref(language: SiteLanguage, hash = "") {
  return (language === "ja" ? "/" : "/?lang=" + language) + hash;
}
