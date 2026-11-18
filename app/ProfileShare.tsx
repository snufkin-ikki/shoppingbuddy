"use client";

import { useState } from "react";
import type { SiteLanguage } from "./site-language";

const copy = {
  ja: { title: "このBuddyの偏愛をシェア", copied: "プロフィールリンクをコピーしました。", fallback: "プロフィールリンクをコピーして共有できます。" },
  en: { title: "Share this Buddy’s passion", copied: "Profile link copied.", fallback: "Copy the profile link to share it." },
  zh: { title: "分享这位伙伴的热爱", copied: "已复制伙伴资料链接。", fallback: "复制资料链接即可分享。" },
};

export default function ProfileShare({ id, name, topic, locale }: {
  id: string;
  name: string;
  topic?: string;
  locale: SiteLanguage;
}) {
  const [copied, setCopied] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const labels = copy[locale];

  async function share() {
    const url = new URL("/", location.origin);
    if (locale !== "ja") url.searchParams.set("lang", locale);
    url.hash = id;
    const title = `${name} | Shopping Buddy`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: topic ?? name, url: url.href });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url.href);
      setManualUrl("");
      setCopied(true);
    } catch {
      setCopied(false);
      setManualUrl(url.href);
    }
  }

  return <div className="buddy-profile-share">
    <button type="button" className="compare-add" onClick={share}>{labels.title}</button>
    {copied && <small role="status">{labels.copied}</small>}
    {manualUrl && <label>{labels.fallback}<input readOnly value={manualUrl} onFocus={event => event.currentTarget.select()} /></label>}
  </div>;
}
