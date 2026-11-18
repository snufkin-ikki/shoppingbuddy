"use client";

import { useRef, useState } from "react";
import type { SiteLanguage } from "./site-language";

const pictograms = [
  <>
    <path className="buddy-usage-accent" d="M14 23c0-8 9-14 21-14s21 6 21 14-9 14-21 14h-7l-9 6 2-9c-4-3-7-6-7-11Zm68 0c0-8 9-14 21-14s21 6 21 14-9 14-21 14h-7l-9 6 2-9c-4-3-7-6-7-11Z" />
    <path d="M27 30c0-7 16-7 16 0m52 0c0-7 16-7 16 0" />
    <path className="buddy-usage-silhouette" d="M35 16a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm68 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    <circle className="buddy-usage-silhouette" cx="77" cy="48" r="8" />
    <path className="buddy-usage-silhouette" d="M69 62q8-9 17-1v16l-3 23h-7l-1-22h-5l-4 22h-7l3-29Z" />
    <path d="m74 62-12 10-12-9m3 0-5-10-7 4 5 9" />
  </>,
  <>
    <circle className="buddy-usage-silhouette" cx="35" cy="49" r="9" />
    <path className="buddy-usage-silhouette" d="M24 64q11-9 23 0l1 15-3 21h-8V82h-5l-3 18h-8l2-22Z" />
    <path d="m42 66 13 6 12-12m-5 4 1-11 8 1-1 8" />
    <path className="buddy-usage-accent" d="m68 31 52-16-16 42-13-16-23-10Zm23 10 29-26M65 19l-8 2m24-10-6 2m28 52-6 3" />
  </>,
  <>
    <path className="buddy-usage-accent" d="M18 21c0-7 9-12 21-12s21 5 21 12-9 12-21 12h-6l-10 8 2-10c-5-3-7-6-7-10Zm60 8c0-7 9-12 21-12s21 5 21 12c0 4-3 8-7 10l2 9-10-7h-6c-12 0-21-5-21-12Z" />
    <path d="M31 21h16m44 8h16" />
    <path className="buddy-usage-silhouette" d="M32 47a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm74 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM22 74q10-12 21 0l1 12-2 14h-8l-1-17-3 17h-8l-2-14Zm74 0q10-9 20 0l2 13-2 13h-8l-2-15-2 15h-8l-2-13Z" />
    <path d="m41 74 12 6 9-8m35 3-12 5-8-7m-17 0 1-9 6 1-1 8m14 1-1-9-6 1 1 8" />
  </>,
  <>
    <rect x="17" y="36" width="85" height="55" rx="8" />
    <path d="M17 52h85M29 76h18" />
    <circle className="buddy-usage-accent" cx="104" cy="35" r="20" fill="white" />
    <path className="buddy-usage-accent" d="M104 25v10l7 5" />
    <path className="buddy-usage-accent" d="m65 73 7 7 13-14" />
  </>,
  <>
    <path className="buddy-usage-accent" d="M70 48S55 36 55 25a15 15 0 1 1 30 0c0 11-15 23-15 23Z" />
    <circle className="buddy-usage-accent" cx="70" cy="25" r="4" />
    <path className="buddy-usage-silhouette" d="M32 43a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm73 0a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM22 69q10-12 21 0l1 12-3 19h-8V82h-3l-2 18h-8l-1-20Zm73 0q10-12 21 0l3 11-3 20h-8l-2-18h-3v18h-8l-3-19Z" />
    <path d="m42 70 11-9 3-8m39 17-11-9-3-8m-61 20-6 12m103-12 7 12" />
  </>,
  <>
    <path className="buddy-usage-accent" d="M10 78V46h17v14m-11-7h5m-5 7h5m-5 7h5m100 11V63m0 4c-7 0-11-5-11-11s5-13 11-13 11 7 11 13-4 11-11 11ZM10 101h117" />
    <path className="buddy-usage-accent" d="M55 24c0-5 6-9 14-9s14 4 14 9-6 9-14 9h-5l-6 5 1-7c-3-2-4-4-4-7Z" />
    <path d="M64 24h10" />
    <circle className="buddy-usage-silhouette" cx="42" cy="46" r="8" />
    <circle className="buddy-usage-silhouette" cx="85" cy="46" r="8" />
    <path strokeWidth="6" d="m41 60 1 17-12 16m12-16 12 15M41 60 30 71l-6 1m17-12 11 8 8-5m24-3 2 17-9 16m9-16 13 13M84 60 74 71l-7-2m17-9 10 9 9-4" />
  </>,
  <>
    <path className="buddy-usage-accent" d="M21 14h22a9 9 0 0 1 9 9v16a9 9 0 0 1-9 9h-5l-6 8-6-8h-5a9 9 0 0 1-9-9V23a9 9 0 0 1 9-9Z" />
    <path className="buddy-usage-accent" d="M95 14h22a9 9 0 0 1 9 9v16a9 9 0 0 1-9 9h-5l-6 8-6-8h-5a9 9 0 0 1-9-9V23a9 9 0 0 1 9-9Z" />
    <path className="buddy-usage-silhouette" d="m32 20 3.4 7.2 7.9 1-5.7 5.5 1.4 7.8-7-3.7-7 3.7 1.4-7.8-5.7-5.5 7.9-1Z" />
    <path className="buddy-usage-silhouette" d="m106 20 3.4 7.2 7.9 1-5.7 5.5 1.4 7.8-7-3.7-7 3.7 1.4-7.8-5.7-5.5 7.9-1Z" />
    <path className="buddy-usage-accent" d="M55 64h28m-6-6 6 6-6 6m6 6H55m6-6-6 6 6 6" />
    <circle className="buddy-usage-silhouette" cx="32" cy="69" r="8" />
    <circle className="buddy-usage-silhouette" cx="106" cy="69" r="8" />
    <path className="buddy-usage-silhouette" d="M15 99v-4a17 13 0 0 1 34 0v4Zm74 0v-4a17 13 0 0 1 34 0v4Z" />
  </>,
];

const copy = {
  ja: {
    heading: "ご利用の流れ",
    previous: "前のステップ",
    next: "次のステップ",
    steps: [
      ["相方を探す／募集する", "好きな街・趣味から、気になる相方を。"],
      ["オファーを出す", "「一緒に歩こう！」とお誘い。"],
      ["チャットで相談", "行きたい街や場所、案内してほしいことや体験の希望をBuddyと相談。集合場所、時間、料金も確認します。"],
      ["リスペクトフィーを支払う", "合意したリスペクトフィーをShopping Buddyに支払います。Buddyはサービスを通じて報酬を受け取ります。"],
      ["待ち合わせる", "約束の場所で「はじめまして！」"],
      ["一緒に街歩き！", "相方とおしゃべりしながら、気の向くままに街を歩こう。ウインドウショッピングも気軽に。"],
      ["お互いをレビューしよう！", "街歩きのあと、Buddyと利用者さんがお互いを評価。おすすめポイントを次の利用者さんへ。"],
    ],
    demo: "現在はデモです。募集から街歩き後の振り返りまで試せます。実際のオファー送信・予約・決済・相互評価はまだできません。",
    action: "募集の流れをデモで試す",
  },
  en: {
    heading: "How Shopping Buddy works",
    previous: "Previous step",
    next: "Next step",
    steps: [
      ["Find a Buddy or post a request", "Search by neighborhood or interest, or post a request with your preferred time and plans."],
      ["Send an offer", "Send a walk offer to a Buddy you found or someone who responded to your request."],
      ["Talk in chat", "Discuss the neighborhood, places to visit and experiences you’d like. Confirm where to meet, the duration and the fee."],
      ["Pay the respect fee", "Pay the agreed respect fee to Shopping Buddy. Your Buddy receives compensation through the service."],
      ["Meet up", "Meet at the agreed time and somewhere easy to find, such as a station entrance."],
      ["Enjoy the neighborhood together", "Chat with your Buddy and wander wherever you feel like going. You can window-shop along the way, too."],
      ["Review each other", "After the walk, both the Buddy and the guest can review each other. Share what you enjoyed to help others find a walking partner."],
    ],
    demo: "Try the demo from posting a request to meeting up. Live offers, bookings, payments and two-way reviews are currently unavailable.",
    action: "Try the walk request demo",
  },
  zh: {
    heading: "使用流程",
    previous: "上一步",
    next: "下一步",
    steps: [
      ["寻找伙伴或发布需求", "按街区或兴趣寻找伙伴，也可以填写时间和计划来发布同行需求。"],
      ["发出邀请", "向你找到的伙伴，或回应你需求的伙伴发出同行邀请。"],
      ["通过聊天沟通", "与 Buddy 商量想去的街区、地点和想体验的活动，并确认集合地点、时长和费用。"],
      ["支付同行酬谢费", "向 Shopping Buddy 支付约定费用，Buddy 通过平台获得报酬。"],
      ["按约会合", "在约好的时间，到车站检票口等容易找到的地点会合。"],
      ["一起享受街区漫步", "和伙伴边走边聊，随心逛逛街区。路过感兴趣的橱窗，也可以停下来看看。"],
      ["互相评价", "街区漫步结束后，伙伴和用户可以互相评价。分享感受和推荐理由，帮助其他人找到同行伙伴。"],
    ],
    demo: "目前可体验从发布需求到会合的演示。正式邀请、预约、支付和互相评价暂未开放。",
    action: "体验发布需求的演示",
  },
};

export default function BuddyUsageFlow({ locale }: { locale: SiteLanguage }) {
  const content = copy[locale];
  const trackRef = useRef<HTMLOListElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const lastStep = content.steps.length - 1;

  function goToStep(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(index, lastStep));
    track.scrollTo({ left: target * track.clientWidth });
  }

  return <section className="buddy-usage-flow" id="how-it-works" aria-labelledby="buddy-usage-title">
    <h2 id="buddy-usage-title">{content.heading}</h2>
    <ol
      className="buddy-usage-steps"
      id="buddy-usage-steps"
      ref={trackRef}
      tabIndex={0}
      aria-labelledby="buddy-usage-title"
      onScroll={(event) => {
        const { scrollLeft, clientWidth } = event.currentTarget;
        if (clientWidth) setActiveStep(Math.max(0, Math.min(lastStep, Math.round(scrollLeft / clientWidth))));
      }}
      onKeyDown={(event) => {
        const target = {
          ArrowLeft: activeStep - 1,
          ArrowRight: activeStep + 1,
          Home: 0,
          End: lastStep,
        }[event.key];
        if (target === undefined) return;
        event.preventDefault();
        goToStep(target);
      }}
    >
      {content.steps.map(([title, description], index) => <li key={title}>
        <div className="buddy-usage-pictogram" aria-hidden="true">
          <svg viewBox="0 0 138 110" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" focusable="false">
            {pictograms[index]}
          </svg>
        </div>
        <div className="buddy-usage-step-copy">
          <h3><span aria-hidden="true">{index + 1}.</span> {title}</h3>
          <p>{description}</p>
        </div>
      </li>)}
    </ol>
    <div className="buddy-usage-controls">
      <button type="button" className="buddy-usage-arrow" aria-label={content.previous} aria-controls="buddy-usage-steps" disabled={activeStep === 0} onClick={() => goToStep(activeStep - 1)}>
        <span aria-hidden="true">←</span>
      </button>
      <div className="buddy-usage-dots">
        {content.steps.map(([title], index) => (
          <button
            key={title}
            type="button"
            aria-label={`${index + 1}. ${title}`}
            aria-controls="buddy-usage-steps"
            aria-current={activeStep === index ? "step" : undefined}
            onClick={() => goToStep(index)}
          />
        ))}
      </div>
      <button type="button" className="buddy-usage-arrow" aria-label={content.next} aria-controls="buddy-usage-steps" disabled={activeStep === lastStep} onClick={() => goToStep(activeStep + 1)}>
        <span aria-hidden="true">→</span>
      </button>
    </div>
    <div className="buddy-usage-demo">
      <p>{content.demo}</p>
      <a href="#public-board">{content.action} <span aria-hidden="true">→</span></a>
    </div>
  </section>;
}
