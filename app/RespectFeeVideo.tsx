"use client";

import PictogramVideo from "./PictogramVideo";
import { useRef } from "react";
import { minimumRespectFeeBeforeTax, minimumRespectFee } from "./directory-data";
import type { SiteLanguage } from "./site-language";

const formatYen = (amount: number) => amount.toLocaleString("ja-JP");
const hourlyFee = formatYen(minimumRespectFee);
const halfHourFeeBeforeTax = formatYen(minimumRespectFeeBeforeTax / 2);

const copy = {
  ja: {
    title: "リスペクトフィーって？",
    unit: "30分",
    price: `${halfHourFeeBeforeTax}円`,
    tax: "＋税から",
    total: `最低60分（税込${hourlyFee}円から）`,
    equivalent: "以降30分単位",
    watch: "動画を見る（34秒）",
    close: "閉じる",
    description: "リスペクトフィーは、Buddyと過ごす時間の利用料金です。行きたい街や場所、案内してほしい体験をBuddyと相談し、時間と料金も確認します。お支払い先はShopping Buddyです。Buddyはサービスを通じて報酬を受け取ります。最低料金は30分4,500円（税抜）からです。最低利用時間は60分（税込9,900円から）で、以降は30分単位です。",
  },
  en: {
    title: "What is a respect fee?",
    unit: "30 min from",
    price: `¥${halfHourFeeBeforeTax}`,
    tax: "+ tax",
    total: `60 min minimum (¥${hourlyFee} incl. tax)`,
    equivalent: "30 min increments",
    watch: "Watch video (34 sec)",
    close: "Close",
    description: "The respect fee covers time spent with your Buddy. Discuss the neighborhood, places you want to visit, and experiences you’d like, along with the duration and fee. You pay Shopping Buddy, and your Buddy receives compensation through the service. Rates start at ¥4,500 before tax per 30 minutes, with a 60-minute minimum of ¥9,900 including tax. Time beyond the minimum is billed in 30-minute increments.",
  },
  zh: {
    title: "什么是同行酬谢费？",
    unit: "30分钟",
    price: `${halfHourFeeBeforeTax}日元`,
    tax: "（未税）起",
    total: `至少60分钟（含税${hourlyFee}日元起）`,
    equivalent: "之后按30分钟计费",
    watch: "观看视频（34秒）",
    close: "关闭",
    description: "同行酬谢费是你与 Buddy 一起逛街的费用。先商量想去的街区、地点和想体验的活动，再确认时长和费用。你向 Shopping Buddy 付款，Buddy 通过平台获得报酬。每30分钟4,500日元起（未税），至少预约60分钟（含税9,900日元起），之后按30分钟计费。",
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
        <span className="respect-fee-video-copy">
          <span className="respect-fee-video-label">{text.title}</span>
          <span className="respect-fee-video-rate">
            <span>{text.unit}</span>
            <span><strong>{text.price}</strong> <small>{text.tax}</small></span>
          </span>
          <small className="respect-fee-video-detail">
            <span>{text.total}</span>
            <span>{text.equivalent}</span>
          </small>
          <span className="respect-fee-video-watch">{text.watch}</span>
        </span>
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
        <PictogramVideo
          videoRef={video}
          src="/respect-fee-platform.mp4"
          poster="/respect-fee-six-poster.webp"
          label={text.title}
          descriptionId="respect-fee-video-description"
          language={locale}
        />
        <p id="respect-fee-video-description">{text.description}</p>
      </dialog>
    </>
  );
}
