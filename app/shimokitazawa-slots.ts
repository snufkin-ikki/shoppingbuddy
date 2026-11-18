import { vintageDemoHref } from "./shimokitazawa-entry";

export const vintageWalkTitle = "下北沢の古着屋を一緒にめぐりたい";
export const vintageWalkDuration = "1時間";

const hour = 3_600_000;
const day = 24 * hour;
const jst = 9 * hour;
const slotTemplates = [
  { weekday: 6, hour: 15, minute: 30 },
  { weekday: 0, hour: 11, minute: 0 },
];
const dateLabel = new Intl.DateTimeFormat("ja-JP", {
  month: "long", day: "numeric", weekday: "short", timeZone: "Asia/Tokyo",
});

export function upcomingVintageSlots(now = Date.now()) {
  const localToday = Math.floor((now + jst) / day) * day;
  const weekday = new Date(localToday).getUTCDay();
  return slotTemplates.map(slot => {
    const offset = (slot.weekday - weekday + 7) % 7;
    let startsAt = localToday + offset * day + slot.hour * hour + slot.minute * 60_000 - jst;
    if (startsAt <= now) startsAt += 7 * day;
    const localTime = new Date(startsAt + jst).toISOString().slice(0, 16);
    return { startsAt, localTime, label: `${dateLabel.format(startsAt)} ${localTime.slice(-5)}` };
  }).sort((a, b) => a.startsAt - b.startsAt);
}

export function vintageSlotRequestHref(source: string, localTime: string) {
  const [path, hash] = vintageDemoHref(source, "public-board").split("#");
  return `${path}&slot=${encodeURIComponent(localTime)}#${hash}`;
}

export function validVintageSlot(value: string | null, now = Date.now()) {
  return upcomingVintageSlots(now).some(slot => slot.localTime === value);
}
