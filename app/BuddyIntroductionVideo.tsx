"use client";

import { useRef } from "react";
import PictogramVideo from "./PictogramVideo";
import type { SiteLanguage } from "./site-language";

const copy = {
  ja: {
    title: "横路一樹 → mimic宝",
    watch: "紹介動画（14秒）",
  },
  en: {
    title: "Ikki Yokoji → Takara (mimic)",
    watch: "Watch the intro (14 sec)",
  },
  zh: {
    title: "横路一树 → mimic 宝",
    watch: "观看推荐短片（14 秒）",
  },
};

export default function BuddyIntroductionVideo({ locale, descriptionId }: {
  locale: SiteLanguage;
  descriptionId: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const content = copy[locale];

  return (
    <details className="buddy-profile-video" onToggle={event => {
      if (!event.currentTarget.open) video.current?.pause();
    }}>
      <summary>
        <strong>{content.title}</strong>
        <span>{content.watch}</span>
      </summary>
      <PictogramVideo
        key={locale}
        videoRef={video}
        src={`/buddy-introduction-takara-${locale}.mp4`}
        poster={`/buddy-introduction-takara-${locale}.webp`}
        label={content.title}
        descriptionId={descriptionId}
        width={960}
        height={540}
        language={locale}
      />
    </details>
  );
}
