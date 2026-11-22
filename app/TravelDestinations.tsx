"use client";

import { useState } from "react";
import { buddySearchRequestHref } from "./buddy-search-request";
import { filterProfiles } from "./directory-data";
import type { SiteLanguage } from "./site-language";
import { travelDestinations, travelMapBounds, type TravelRegion } from "./travel-destinations";
import "./travel-destinations.css";

const copy = {
  ja: {
    title: "街からBuddyを探す",
    description: "近所でも旅先でも、その街の「好き」に詳しい相方と街歩き。",
    japan: "日本", asia: "アジア", world: "世界", tokyo: "東京",
    region: "地域を選ぶ", registered: "登録Buddyを見る", request: "相方探しを依頼する",
  },
  en: {
    title: "Find a Buddy by city",
    description: "Near home or on a trip, explore a city with someone who knows and loves it.",
    japan: "Japan", asia: "Asia", world: "World", tokyo: "Tokyo",
    region: "Choose a region", registered: "See listed Buddies", request: "Ask us to find a Buddy",
  },
  zh: {
    title: "按城市寻找同行伙伴",
    description: "无论在家附近还是旅途中，都可以和熟悉当地的伙伴一起漫步。",
    japan: "日本", asia: "亚洲", world: "全球", tokyo: "东京",
    region: "选择地区", registered: "查看已登记的伙伴", request: "委托寻找伙伴",
  },
};

const regions = ["japan", "asia", "world"] satisfies TravelRegion[];
const languageIndex = { ja: 0, en: 1, zh: 2 } as const;
const listedDestinations = new Set(Object.values(travelDestinations).flat()
  .filter(destination => filterProfiles("", destination.names[0], "", "registered").length > 0)
  .map(destination => destination.names[0]));

export default function TravelDestinations({ locale, onBrowse }: {
  locale: SiteLanguage;
  onBrowse: (area: string) => void;
}) {
  const [region, setRegion] = useState<TravelRegion>("japan");
  const labels = copy[locale];
  const destinations = travelDestinations[region];
  const [west, east, south, north] = travelMapBounds[region];
  const markers = new Map<string, { point: readonly [number, number]; listed: boolean }>();

  for (const destination of destinations) {
    const key = destination.point.join(",");
    markers.set(key, {
      point: destination.point,
      listed: listedDestinations.has(destination.names[0]) || (markers.get(key)?.listed ?? false),
    });
  }

  return (
    <section className="travel-destinations" id="travel-destinations" aria-labelledby="travel-destinations-title">
      <div className="travel-heading">
        <h2 id="travel-destinations-title">{labels.title}</h2>
        <p>{labels.description}</p>
      </div>

      <div className="travel-region-switch" role="group" aria-label={labels.region}>
        {regions.map(id => <button key={id} type="button" aria-pressed={region === id}
          aria-controls="travel-destination-results" onClick={() => setRegion(id)}>{labels[id]}</button>)}
      </div>

      <div className="travel-content" id="travel-destination-results">
        <div className="travel-city-list">
          <div className="travel-map-key">
            <span><i className="travel-dot" data-listed="true" aria-hidden="true" />{labels.registered}</span>
            <span><i className="travel-dot" aria-hidden="true" />{labels.request}</span>
          </div>
          <ul className="travel-cities">
            {destinations.map(({ names }) => {
              const area = names[0];
              const name = names[languageIndex[locale]];
              const listed = listedDestinations.has(area);
              const dot = <i className="travel-dot" data-listed={listed} aria-hidden="true" />;
              return <li key={area}>
                {listed
                  ? <button type="button" onClick={() => onBrowse(area)} aria-label={`${name} · ${labels.registered}`}>{dot}{name}</button>
                  : <a href={buddySearchRequestHref(area, undefined, locale)} aria-label={`${name} · ${labels.request}`}>{dot}{name}</a>}
              </li>;
            })}
          </ul>
        </div>

        <div className="travel-map" aria-hidden="true">
          <img src={`/travel-map-${region}.webp`} width={1200} height={650} alt="" />
          {Array.from(markers, ([key, { point: [longitude, latitude], listed }]) => (
            <span key={key} className="travel-map-marker" data-listed={listed} style={{
              left: `${(longitude - west) / (east - west) * 100}%`,
              top: `${(north - latitude) / (north - south) * 100}%`,
            }}>
              {region === "japan" && key === destinations[1].point.join(",") &&
                <span className="travel-map-label">{labels.tokyo}</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
