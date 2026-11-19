"use client";

import { useRef } from "react";
import PictogramVideo from "../PictogramVideo";
import type { SiteLanguage } from "../site-language";

const copy = {
  ja: {
    title: "見つかったらLINEで教えて！",
    watch: "依頼の流れを28秒で見る",
  },
  en: {
    title: "Let me know on LINE",
    watch: "See how it works in 28 seconds",
  },
  zh: {
    title: "找到后通过 LINE 通知我",
    watch: "28 秒了解申请流程",
  },
};

export default function BuddyFinderVideo({ language }: { language: SiteLanguage }) {
  const video = useRef<HTMLVideoElement>(null);
  const content = copy[language];

  return (
    <section className="buddy-finder-video" aria-labelledby="buddy-finder-video-title">
      <h2 id="buddy-finder-video-title">{content.title}</h2>
      <p>{content.watch}</p>
      <PictogramVideo
        videoRef={video}
        src={`/buddy-finder-${language}.mp4`}
        poster={`/buddy-finder-${language}.webp`}
        label={content.title}
        descriptionId="buddy-finder-lead"
        width={960}
        height={540}
        language={language}
      />
    </section>
  );
}
