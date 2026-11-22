"use client";

import PictogramVideo from "./PictogramVideo";
import type { SiteLanguage } from "./site-language";

const copy = {
  ja: {
    title: "SNSのつながり方を見る（25秒）",
  },
  en: {
    title: "How social connections work (25 sec)",
  },
  zh: {
    title: "观看社交平台说明（25 秒）",
  },
};

export default function BuddySocialConnectionsVideo({ locale }: { locale: SiteLanguage }) {
  const content = copy[locale];

  return (
    <div className="buddy-profile-video">
      <p>{content.title}</p>
      <PictogramVideo
        key={locale}
        src={`/buddy-social-connections-fan-${locale}.mp4`}
        poster={`/buddy-social-connections-fan-${locale}.webp`}
        label={content.title}
        width={960}
        height={540}
        language={locale}
      />
    </div>
  );
}
