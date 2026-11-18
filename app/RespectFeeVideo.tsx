"use client";

import ChapterVideo from "./ChapterVideo";
import { useRef } from "react";
import type { SiteLanguage } from "./site-language";

const chapterTimes = [0.1, 5.2, 12.2, 17.1, 24.2, 29.3] as const;
const chapterTitles = {
  ja: ["リスペクトフィーとは", "1時間の最低料金", "30分換算", "行きたい街・体験を相談", "Shopping Buddyに支払う", "待ち合わせ・街歩き"],
  en: ["What is the fee?", "Minimum for one hour", "30-minute equivalent", "Discuss where to go and what to do", "Pay Shopping Buddy", "Meet and walk"],
  zh: ["什么是同行酬谢费？", "一小时最低费用", "30分钟折算", "商量地点与体验", "向 Shopping Buddy 付款", "会合并逛街"],
};
const controls = {
  ja: { play: "再生", pause: "一時停止", choose: "場面を選ぶ", unavailable: "再生できませんでした。もう一度お試しください。" },
  en: { play: "Play", pause: "Pause", choose: "Choose a scene", unavailable: "Could not play the video. Please try again." },
  zh: { play: "播放", pause: "暂停", choose: "选择场景", unavailable: "无法播放，请重试。" },
};

const copy = {
  ja: {
    title: "リスペクトフィーって？",
    watch: "6つの場面で見る（34秒）",
    close: "閉じる",
    description: "リスペクトフィーは、Buddyと過ごす時間の利用料金です。行きたい街や場所、案内してほしい体験をBuddyと相談し、時間と料金も確認します。お支払い先はShopping Buddyです。Buddyはサービスを通じて報酬を受け取ります。最低料金は1時間5,500円＋税（税込6,050円）です。30分換算は2,750円＋税（税込3,025円）で、利用は1時間からです。",
  },
  en: {
    title: "What is a respect fee?",
    watch: "Watch the six scenes (34 seconds)",
    close: "Close",
    description: "The respect fee covers time spent with your Buddy. Discuss the neighborhood, places you want to visit, and experiences you’d like, along with the duration and fee. You pay Shopping Buddy, and your Buddy receives compensation through the service. The minimum is one hour at ¥6,050 including tax, equivalent to ¥3,025 per 30 minutes.",
  },
  zh: {
    title: "什么是同行酬谢费？",
    watch: "观看6个场景（34秒）",
    close: "关闭",
    description: "同行酬谢费是你与 Buddy 一起逛街的费用。先商量想去的街区、地点和想体验的活动，再确认时长和费用。你向 Shopping Buddy 付款，Buddy 通过平台获得报酬。最低时长为一小时，含税6,050日元，折合每30分钟3,025日元。",
  },
};

export default function RespectFeeVideo({ locale }: { locale: SiteLanguage }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const text = copy[locale];

  return (
    <>
      <button
        id="respect-fee-video"
        type="button"
        className="respect-fee-video-trigger"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <img src="/respect-fee-six-thumb.webp" width="52" height="52" alt="" />
        <span><strong>{text.title}</strong><small>{text.watch}</small></span>
        <span className="respect-fee-video-play" aria-hidden="true">▶</span>
      </button>
      <dialog
        ref={dialog}
        className="respect-fee-dialog"
        aria-labelledby="respect-fee-video-title"
        onClose={() => video.current?.pause()}
      >
        <div className="respect-fee-dialog-header">
          <h2 id="respect-fee-video-title">{text.title}</h2>
          <form method="dialog">
            <button type="submit" aria-label={text.close}>×</button>
          </form>
        </div>
        <ChapterVideo
          videoRef={video}
          src="/respect-fee-platform.mp4"
          poster="/respect-fee-six-poster.webp"
          label={text.title}
          descriptionId="respect-fee-video-description"
          chapters={chapterTimes.map((time, index) => [time, chapterTitles[locale][index]] as const)}
          controls={controls[locale]}
        />
        <p id="respect-fee-video-description">{text.description}</p>
      </dialog>
    </>
  );
}
