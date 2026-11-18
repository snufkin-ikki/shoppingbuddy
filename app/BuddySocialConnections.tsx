import type { BuddyProfile } from "./directory-data";
import type { SiteLanguage } from "./site-language";

const networks = {
  instagram: "Instagram",
  x: "X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  threads: "Threads",
} as const;

type Network = keyof typeof networks;
type Preference = "mutual" | "follow-only" | "declined";
type Preferences = Partial<Record<Network, Preference>>;

// Record a preference only after the Buddy confirms it. Missing entries are unconfirmed.
const buddyPreferences: Partial<Record<BuddyProfile["id"], Preferences>> = {
  "ikki-yokoji": {
    instagram: "mutual",
    x: "mutual",
    linkedin: "mutual",
    facebook: "mutual",
    threads: "mutual",
  },
};

const copy = {
  ja: {
    heading: "相互フォロー・つながり",
    ask: "街歩きのあと、お互いが希望すれば、表示されているSNSでつながれます。",
    unknown: "相互につながれるSNSは未確認です。",
    none: "相互につながれるSNSはありません。",
    note: "街歩きの依頼にあたり、相互フォロー・つながりは任意です。",
  },
  en: {
    heading: "Mutual follows & connections",
    ask: "You can connect after the walk if you both agree.",
    unknown: "This Buddy’s mutual connection preferences are unconfirmed.",
    none: "This Buddy does not offer mutual social connections.",
    note: "Mutual follows and connections are optional.",
  },
  zh: {
    heading: "互相关注与添加好友",
    ask: "街区漫步结束后，双方同意即可互相关注或添加好友。",
    unknown: "这位伙伴尚未确认可以互相关注的平台。",
    none: "这位伙伴没有开放互相关注的平台。",
    note: "互相关注或添加好友由双方自愿决定。",
  },
};

export default function BuddySocialConnections({ buddyId, locale }: {
  buddyId: BuddyProfile["id"];
  locale: SiteLanguage;
}) {
  const preferences = buddyPreferences[buddyId] ?? {};
  const channels = Object.keys(networks) as Network[];
  const mutual = channels.filter(channel => preferences[channel] === "mutual");
  const allConfirmed = channels.every(channel => preferences[channel] !== undefined);
  const labels = copy[locale];

  return <section className="buddy-social-connections" aria-labelledby="buddy-social-connections-title">
    <h3 id="buddy-social-connections-title">{labels.heading}</h3>
    {mutual.length > 0 ? <>
      <ul aria-label={labels.heading}>
        {mutual.map(channel => <li key={channel}>{networks[channel]}</li>)}
      </ul>
      <p>{labels.ask}</p>
    </> : <p>{allConfirmed ? labels.none : labels.unknown}</p>}
    <p className="buddy-social-connections-note">{labels.note}</p>
  </section>;
}
