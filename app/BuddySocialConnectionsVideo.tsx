"use client";

import { useRef } from "react";
import PictogramVideo from "./PictogramVideo";
import type { SiteLanguage } from "./site-language";

const copy = {
  ja: {
    title: "SNSのつながり方を見る（16秒）",
  },
  en: {
    title: "How social connections work (16 sec)",
  },
  zh: {
    title: "观看社交平台说明（16 秒）",
  },
};

export default function BuddySocialConnectionsVideo({ locale }: { locale: SiteLanguage }) {
  const video = useRef<HTMLVideoElement>(null);
  const content = copy[locale];

  return (
    <details className="buddy-profile-video" onToggle={event => {
      if (!event.currentTarget.open) video.current?.pause();
    }}>
      <summary><strong>{content.title}</strong></summary>
      <PictogramVideo
        key={locale}
        videoRef={video}
        src={`/buddy-social-connections-${locale}.mp4`}
        poster={`/buddy-social-connections-${locale}.webp`}
        label={content.title}
        descriptionId="buddy-social-connections-note"
        width={960}
        height={540}
        language={locale}
      />
    </details>
  );
}
