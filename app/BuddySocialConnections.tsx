import type { BuddyProfile } from "./directory-data";
import type { SiteLanguage } from "./site-language";
import BuddySocialConnectionsVideo from "./BuddySocialConnectionsVideo";

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
    instagram: "follow-only",
    x: "mutual",
    linkedin: "mutual",
    facebook: "mutual",
    threads: "mutual",
  },
};

const copy = {
  ja: {
    heading: "相互フォロー・つながり",
    mutual: "相互フォローOK",
    followOnly: "フォロー歓迎・相互フォローなし",
    followNote: "Buddyからのフォローバックや個別のつながりはありません。",
    unknown: "相互につながれるSNSは未確認です。",
    none: "相互につながれるSNSはありません。",
    note: "SNSでの交流は任意です。リスペクトフィーは街歩きの料金です。",
  },
  en: {
    heading: "Follows & connections",
    mutual: "Mutual follows welcome",
    followOnly: "Followers welcome · no follow-back",
    followNote: "The Buddy does not follow back or connect individually on these platforms.",
    unknown: "This Buddy’s mutual connection preferences are unconfirmed.",
    none: "This Buddy does not offer mutual social connections.",
    note: "Social connections are optional. The respect fee covers the walk.",
  },
  zh: {
    heading: "关注与联系",
    mutual: "可互相关注",
    followOnly: "欢迎关注 · 不回关",
    followNote: "Buddy 不会在这些平台回关或添加好友。",
    unknown: "这位伙伴尚未确认可以互相关注的平台。",
    none: "这位伙伴没有开放互相关注的平台。",
    note: "社交平台上的互动由双方自愿决定。同行酬谢费是街区漫步的费用。",
  },
};

export default function BuddySocialConnections({ buddyId, locale }: {
  buddyId: BuddyProfile["id"];
  locale: SiteLanguage;
}) {
  const preferences = buddyPreferences[buddyId] ?? {};
  const channels = Object.keys(networks) as Network[];
  const mutual = channels.filter(channel => preferences[channel] === "mutual");
  const followOnly = channels.filter(channel => preferences[channel] === "follow-only");
  const allConfirmed = channels.every(channel => preferences[channel] !== undefined);
  const labels = copy[locale];

  return <section className="buddy-social-connections" aria-labelledby="buddy-social-connections-title">
    <h3 id="buddy-social-connections-title">{labels.heading}</h3>
    {mutual.length > 0 ? <>
      <h4>{labels.mutual}</h4>
      <ul aria-label={labels.mutual}>
        {mutual.map(channel => <li key={channel}>{networks[channel]}</li>)}
      </ul>
    </> : <p>{allConfirmed ? labels.none : labels.unknown}</p>}
    {followOnly.length > 0 && <div className="buddy-social-follow-only">
      <h4>{labels.followOnly}</h4>
      <ul aria-label={labels.followOnly}>
        {followOnly.map(channel => <li key={channel}>{networks[channel]}</li>)}
      </ul>
      <p>{labels.followNote}</p>
    </div>}
    <p className="buddy-social-connections-note" id="buddy-social-connections-note">{labels.note}</p>
    <BuddySocialConnectionsVideo key={buddyId} locale={locale} />
  </section>;
}
