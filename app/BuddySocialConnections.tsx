import type { BuddyProfile } from "./directory-data";
import type { SiteLanguage } from "./site-language";
import BuddySocialConnectionsVideo from "./BuddySocialConnectionsVideo";

const networks = {
  instagram: { name: "Instagram", icon: "IG" },
  x: { name: "X", icon: "X" },
  linkedin: { name: "LinkedIn", icon: "in" },
  facebook: { name: "Facebook", icon: "f" },
  threads: { name: "Threads", icon: "@" },
} as const;
type Network = keyof typeof networks;

// Only list platforms where the Buddy has explicitly agreed to mutual follows.
const mutualFollowNetworks: Partial<Record<BuddyProfile["id"], readonly Network[]>> = {
  "ikki-yokoji": ["x", "linkedin", "facebook", "threads"],
};

const instagramProfiles: Readonly<Record<string, string>> = {
  "tapi-style": "tapi.style",
  shibalife: "shibalife.jp",
  "mayumi-asakura": "mayumi_asakura",
  "mari-kumagai": "marilovesbeauty.de",
  coco: "coco_7520",
  "ikki-yokoji": "ikkiyokoji",
  "satoshi-miya": "satoshi_miya_",
};

const copy = {
  ja: {
    heading: "BuddyとのSNSのつながり方",
    mutual: "相互フォローOK",
  },
  en: {
    heading: "Connecting with your Buddy on social media",
    mutual: "Mutual follows OK",
  },
  zh: {
    heading: "如何在社交平台与 Buddy 联系",
    mutual: "可互相关注",
  },
};

export default function BuddySocialConnections({ buddyId, locale, instagramAccount }: {
  buddyId: BuddyProfile["id"];
  locale: SiteLanguage;
  instagramAccount?: string;
}) {
  const approved = mutualFollowNetworks[buddyId] ?? [];
  const account = instagramAccount ?? instagramProfiles[buddyId];
  const links: Partial<Record<Network, string>> = {
    instagram: account ? `https://www.instagram.com/${account}/` : undefined,
    x: buddyId === "ayano-tominaga" ? "https://x.com/ayanotdo" : undefined,
  };
  const channels = (Object.keys(networks) as Network[]).filter(channel => links[channel] || approved.includes(channel));
  const labels = copy[locale];

  return <section className="buddy-social-connections" aria-labelledby="buddy-social-connections-title">
    <h3 id="buddy-social-connections-title">{labels.heading}</h3>
    {channels.length > 0 && <ul>
      {channels.map(channel => {
        const platform = networks[channel];
        const href = links[channel];
        const name = <><span className="buddy-social-icon" aria-hidden="true">{platform.icon}</span>{platform.name}</>;
        return <li key={channel}>
          {href ? <a href={href} target="_blank" rel="noopener noreferrer">{name}</a> : <span className="buddy-social-platform">{name}</span>}
          {approved.includes(channel) && <span className="buddy-social-badge">{labels.mutual}</span>}
        </li>;
      })}
    </ul>}
    <BuddySocialConnectionsVideo key={buddyId} locale={locale} />
  </section>;
}
