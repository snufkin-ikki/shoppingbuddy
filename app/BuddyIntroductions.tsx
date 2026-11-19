import { useEffect, useState } from "react";
import BuddyIntroductionVideo from "./BuddyIntroductionVideo";
import type { BuddyIntroduction } from "./buddy-introductions";
import { buddyIntroductions } from "./buddy-introductions";
import { profiles } from "./directory-data";

type Connection = { authorId: string; targetId: string };
type PublicNetwork = { introductions: (Connection & BuddyIntroduction)[]; connections: Connection[] };

const actions = {
  ja: { write: "このBuddyを紹介する", manage: "Buddyの紹介・招待", outgoing: "紹介したBuddy", invitedBy: "招待したBuddy" },
  en: { write: "Introduce this Buddy", manage: "Buddy introductions & invites", outgoing: "Buddies they introduced", invitedBy: "Invited by" },
  zh: { write: "推荐这位同伴", manage: "同伴推荐与邀请", outgoing: "这位同伴推荐的人", invitedBy: "邀请人" },
};

const labels = {
  ja: { title: "Buddyからの他己紹介", author: "紹介したBuddy", strengths: "このBuddyの魅力", experience: "一緒に歩くと楽しめること", goodFor: "こんな人におすすめ" },
  en: { title: "Introductions from other Buddies", author: "Introduced by", strengths: "What makes this Buddy stand out", experience: "What you can enjoy together", goodFor: "Recommended for" },
  zh: { title: "其他同伴的推荐", author: "推荐人", strengths: "这位同伴的魅力", experience: "一起逛街可以体验什么", goodFor: "适合这样的人" },
};

export default function BuddyIntroductions({ profileId, locale, openProfile }: {
  profileId: string;
  locale: keyof typeof labels;
  openProfile: (profileId: string) => void;
}) {
  const [network, setNetwork] = useState<PublicNetwork>();
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/buddy-network/public?" + new URLSearchParams({ buddy: profileId }), { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data) setNetwork(data); })
      .catch(() => {});
    return () => controller.abort();
  }, [profileId]);

  const entries = [
    ...(buddyIntroductions[profileId] ?? []),
    ...(network?.introductions.filter(entry => entry.targetId === profileId) ?? []),
  ].flatMap(introduction => {
    const author = profiles.find(profile => profile.id === introduction.authorId && profile.id !== profileId);
    const showVideo = profileId === "mimic-takara" && introduction === buddyIntroductions["mimic-takara"][0];
    return author ? [{ introduction, author, showVideo }] : [];
  });
  const outgoingIds = new Set(Object.entries(buddyIntroductions)
    .filter(([, list]) => list.some(entry => entry.authorId === profileId))
    .map(([id]) => id));
  const incomingIds = new Set<string>();
  for (const connection of network?.introductions ?? []) {
    if (connection.authorId === profileId) outgoingIds.add(connection.targetId);
  }
  for (const connection of network?.connections ?? []) {
    if (connection.authorId === profileId) outgoingIds.add(connection.targetId);
    if (connection.targetId === profileId) incomingIds.add(connection.authorId);
  }
  const outgoing = profiles.filter(profile => outgoingIds.has(profile.id));
  const incoming = profiles.filter(profile => incomingIds.has(profile.id));
  const copy = labels[locale];
  const action = actions[locale];

  return <section className="buddy-introductions" aria-labelledby="buddy-introductions-title">
    <h3 id="buddy-introductions-title">{copy.title}</h3>
    {entries.length > 0 && <ul className="buddy-introduction-list">
      {entries.map(({ introduction, author, showVideo }) => <li className="buddy-introduction" key={author.id}>
        <div className="buddy-introduction-author">
          <img src={author.image} alt="" width={48} height={48} loading="lazy" />
          <div>
            <small>{copy.author}</small>
            <button type="button" onClick={() => openProfile(author.id)}>{author.name}</button>
            {introduction.relationship && <p>{introduction.relationship}</p>}
          </div>
        </div>
        {showVideo && <BuddyIntroductionVideo locale={locale} descriptionId="takara-introduction-strengths" />}
        <dl>
          <div><dt>{copy.strengths}</dt><dd id={showVideo ? "takara-introduction-strengths" : undefined}>{introduction.strengths}</dd></div>
          <div><dt>{copy.experience}</dt><dd>{introduction.experience}</dd></div>
          <div><dt>{copy.goodFor}</dt><dd>{introduction.goodFor}</dd></div>
        </dl>
      </li>)}
    </ul>}
    {incoming.length > 0 && <div className="buddy-network-actions">
      <strong>{action.invitedBy}</strong>
      {incoming.map(buddy => <a className="buddy-network-link" href={"/#" + buddy.id} key={buddy.id} onClick={event => {
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          openProfile(buddy.id);
        }
      }}>{buddy.name}</a>)}
    </div>}
    {outgoing.length > 0 && <div className="buddy-network-actions">
      <strong>{action.outgoing}</strong>
      {outgoing.map(buddy => <a className="buddy-network-link" href={"/#" + buddy.id} key={buddy.id} onClick={event => {
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          openProfile(buddy.id);
        }
      }}>{buddy.name}</a>)}
    </div>}
    <div className="buddy-network-actions">
      <a className="buddy-network-link" href={"/buddy-network?" + new URLSearchParams({ buddy: profileId })}>{action.write}</a>
      <a className="buddy-network-link" href="/buddy-network">{action.manage}</a>
    </div>
  </section>;
}
