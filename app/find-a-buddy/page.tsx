import type { Metadata } from "next";
import { minimumRespectFee } from "../directory-data";
import { maxAreaLength } from "../buddy-search-request";
import { homeHref, siteLanguage } from "../site-language";
import BuddySearchForm from "./BuddySearchForm";
import { finderCopy } from "./copy";

type FinderParams = { area?: string | string[]; duration?: string; budget?: string; interests?: string; lang?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<FinderParams> }): Promise<Metadata> {
  const copy = finderCopy[siteLanguage((await searchParams).lang)];
  return { title: copy.title + " | Shopping Buddy", description: copy.lead };
}

export default async function FindABuddy({ searchParams }: { searchParams: Promise<FinderParams> }) {
  const { area, duration, budget, interests, lang } = await searchParams;
  const language = siteLanguage(lang);
  const copy = finderCopy[language];
  const initialArea = typeof area === "string" ? area.trim().slice(0, maxAreaLength) : "";
  const initialDescription = duration === "60" && typeof budget === "string" && /^\d{1,7}$/.test(budget) && Number(budget) >= minimumRespectFee
    ? copy.preferences(duration, Number(budget).toLocaleString("ja-JP"), typeof interests === "string" ? interests.trim().slice(0, 80) : "")
    : "";

  return <main lang={language} className="vintage-entry buddy-finder">
    <header className="vintage-header">
      <a href={homeHref(language)} aria-label={copy.home}><img src="/shopping-buddy-logo-final.png" width={230} height={42} alt="Shopping Buddy" /></a>
      <a href={homeHref(language, "#directory")}>{copy.directory}</a>
    </header>
    <section className="buddy-finder-panel">
      <h1>{copy.title}</h1>
      <p className="buddy-finder-lead">{copy.lead}</p>
      <BuddySearchForm initialArea={initialArea} initialDescription={initialDescription} language={language} />
    </section>
  </main>;
}
