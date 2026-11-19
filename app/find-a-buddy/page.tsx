import type { Metadata } from "next";
import { maxAreaLength, normalizeBuddySearchBudget } from "../buddy-search-request";
import { homeHref, siteLanguage } from "../site-language";
import BuddySearchForm from "./BuddySearchForm";
import BuddyFinderVideo from "./BuddyFinderVideo";
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
  const initialBudget = duration === "60" ? normalizeBuddySearchBudget(budget) : null;
  const initialDescription = initialBudget !== null
    ? copy.preferences("60", typeof interests === "string" ? interests.trim().slice(0, 80) : "")
    : "";

  return <main lang={language} className="vintage-entry buddy-finder">
    <header className="vintage-header">
      <a href={homeHref(language)} aria-label={copy.home}><img src="/shopping-buddy-logo-final.png" width={230} height={42} alt="Shopping Buddy" /></a>
      <a href={homeHref(language, "#directory")}>{copy.directory}</a>
    </header>
    <section className="buddy-finder-panel">
      <h1>{copy.title}</h1>
      <p className="buddy-finder-lead" id="buddy-finder-lead">{copy.lead}</p>
      <BuddyFinderVideo language={language} />
      <BuddySearchForm initialArea={initialArea} initialDescription={initialDescription} initialBudget={initialBudget} language={language} />
    </section>
  </main>;
}
