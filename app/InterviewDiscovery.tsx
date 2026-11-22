"use client";

import { useRef } from "react";
import { mediaFeatures, profiles } from "./directory-data";
import type { SiteLanguage } from "./site-language";

// One editorial selection per Buddy, drawn from their existing media section.
const featuredPublishers: Partial<Record<string, string>> = {
  "mari-kumagai": "日本化粧品検定協会",
  "kodai-yasuno": "BASE U",
  "kohei-miyata": "SlowNews",
  "ikki-yokoji": "サイドラインズ",
  "ayano-tominaga": "メシ通／ホットペッパーグルメ",
  "lua-soda": "Business Insider Japan",
  "satoshi-miya": "ヨガジェネレーション",
  "akiko-kobayashi": "Vine Online／同志社女子大学",
  ucci: "Peatix",
  "takashi-onizawa": "HUMAN STORY",
  "kotaro-shinada": "Bookcafe DOOR",
  "keita-yanagawa": "Granty",
  "makoto-tokuda": "ビザスク",
  "minoru-doi": "ながさき経済web",
  "kiyotaka-yamana": "欲しかった暮らしラボ",
  "kenji-takahashi": "Bluebook",
  coco: "Baguio JIC",
  "tapi-style": "AdvancedTime／小学館",
  shibalife: "GOLF FOCUS",
  "mayumi-asakura": "毎日が発見ネット",
};

const interviews = Object.entries(featuredPublishers).flatMap(([id, publisher]) => {
  const buddy = profiles.find(profile => profile.id === id);
  const articles = mediaFeatures[id];
  const article = articles?.find(item => item.publisher === publisher && item.image)
    ?? articles?.find(item => item.publisher === publisher);
  return buddy && article ? [{ buddy, article }] : [];
});

const copy = {
  ja: { title: "インタビュー記事から探す", previous: "前の記事へ", next: "次の記事へ", profile: "プロフィールを見る" },
  en: { title: "Find a Buddy through interviews", previous: "Previous interviews", next: "Next interviews", profile: "View profile" },
  zh: { title: "通过采访寻找 Buddy", previous: "上一篇采访", next: "下一篇采访", profile: "查看个人资料" },
};

export default function InterviewDiscovery({ locale }: { locale: SiteLanguage }) {
  const list = useRef<HTMLUListElement>(null);
  const labels = copy[locale];

  function scroll(direction: number) {
    const rail = list.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth });
  }

  return (
    <section className="walk-ideas interview-discovery" aria-labelledby="interview-discovery-title">
      <div className="interview-discovery-heading">
        <h3 id="interview-discovery-title">{labels.title}</h3>
        <div className="interview-discovery-controls">
          <button type="button" aria-label={labels.previous} onClick={() => scroll(-1)}>‹</button>
          <button type="button" aria-label={labels.next} onClick={() => scroll(1)}>›</button>
        </div>
      </div>
      <ul ref={list} className="interview-discovery-list">
        {interviews.map(({ buddy, article }) => (
          <li key={buddy.id}>
            <a href={`#${buddy.id}`} className="interview-discovery-card">
              <img
                className="interview-discovery-image"
                src={article.image || buddy.image}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={event => {
                  const photo = event.currentTarget;
                  if (photo.getAttribute("src") === buddy.image) photo.hidden = true;
                  else photo.src = buddy.image;
                }}
              />
              <div className="interview-discovery-caption">
                <small>{article.publisher}</small>
                <strong lang="ja">{article.title}</strong>
                <span>{buddy.name}</span>
                <span className="interview-discovery-link">{labels.profile} <span aria-hidden="true">→</span></span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
