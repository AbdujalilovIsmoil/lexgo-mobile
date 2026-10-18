import { categoryOf } from "./classify";
import type { Notification } from "./types";

const WINDOW_MS = 60_000;
const dataKey = (d: Notification["data"]) => JSON.stringify(Object.keys(d).filter((k) => k !== "event").sort().map((k) => [k, d[k]]));

// Identity of an event across its per-channel rows (same key = same event).
export const foldKey = (n: Notification): string => (n.event ? `e:${n.event}|${dataKey(n.data)}` : `t:${n.title}|${n.body}`);

// The cascade writes one row per channel for one event (same text, payload and
// time). Fold those into a single item: same event + payload within a minute,
// never two rows on the same channel. The in_app row represents the group.
export function foldNotifications(rows: Notification[]): Notification[] {
  type Group = { key: string; at: number; list: Notification[] };
  const groups: Group[] = [];
  for (const n of rows) {
    const key = foldKey(n);
    const at = Date.parse(n.createdAt);
    const ch = n.channels[0];
    const g = groups.find((x) => x.key === key && Math.abs(at - x.at) <= WINDOW_MS && !(ch && x.list.some((m) => m.channels[0] === ch)));
    if (g) g.list.push(n);
    else groups.push({ key, at, list: [n] });
  }
  return groups.map(({ list }) => {
    const rep = list.find((m) => m.channels[0] === "in_app") ?? list[0];
    const channels = [...new Set(list.flatMap((m) => m.channels))];
    return {
      ...rep,
      ids: list.flatMap((m) => m.ids),
      channels,
      data: Object.assign({}, ...list.map((m) => m.data)) as Notification["data"],
      read: list.every((m) => m.read),
      createdAt: list.reduce((a, m) => (m.createdAt < a ? m.createdAt : a), rep.createdAt),
      category: categoryOf(rep.event, channels, rep.title, Object.assign({}, ...list.map((m) => m.data))),
    };
  });
}
