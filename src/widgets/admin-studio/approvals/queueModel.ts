import type { StudioAccess, StudioConstructor, StudioDetail } from "@/entities/admin-studio";
import { asStr } from "@/shared/lib/json";
import { canPublishItem, isMine, submittedOf } from "./helpers";

import { NEEDS, needOf, type Need } from "./queueCore";

export { NEEDS, needOf, versionDiff, type Need, type Change, type Diff } from "./queueCore";
export type Section = "mine" | "others" | "done";

export type Ctx = { a: StudioAccess; ctor: (code: string) => StudioConstructor | null; me: string };
// Yours: a decision or a publish you may make, or work returned to you as the author.
export function sectionOf(d: StudioDetail, x: Ctx): Section | "" {
  if (d.status === "published") return "done";
  const n = needOf(d);
  if (!n) return "";
  const mine = n === "returned" ? !!x.me && asStr(d.raw.owner_user_id) === x.me : isMine(d, x.a, x.ctor(d.code));
  return mine ? "mine" : "others";
}

export type Row = { type: "head"; key: string; title: string; hint?: string; count: number; tone: "mine" | "others" | "done" } | { type: "item"; key: string; item: StudioDetail; section: Section; need: Need | "" };

export type Labels = { yours: (n: number) => string; others: string; done: string; doneHint: (n: number) => string; need: Record<Section, Record<Need, string>> };

// The queue as the web draws it: "waiting for you" (to check, to publish, returned to you), then "with others", each oldest first, then the
// collapsible "completed" (its heading always, its rows only when `showDone`).
export function buildRows(items: StudioDetail[], done: StudioDetail[], x: Ctx, l: Labels, need: Need | "", showDone: boolean): Row[] {
  const by = (s: Section, n: Need) => items.filter((d) => sectionOf(d, x) === s && needOf(d) === n).sort((p, q) => (Date.parse(submittedOf(p).at) || 0) - (Date.parse(submittedOf(q).at) || 0));
  const out: Row[] = [];
  const mineTotal = NEEDS.reduce((n, k) => n + by("mine", k).length, 0);
  for (const s of ["mine", "others"] as const) {
    if (s === "mine" && !mineTotal) continue;
    const kinds = NEEDS.filter((k) => !need || k === need);
    const lists = kinds.map((k) => ({ k, list: by(s, k) })).filter((g) => g.list.length);
    if (!lists.length) continue;
    out.push({ type: "head", key: `h:${s}`, title: s === "mine" ? l.yours(mineTotal) : l.others, count: lists.reduce((n, g) => n + g.list.length, 0), tone: s });
    for (const g of lists) {
      out.push({ type: "head", key: `h:${s}:${g.k}`, title: l.need[s][g.k], count: g.list.length, tone: s });
      g.list.forEach((item) => out.push({ type: "item", key: item.id, item, section: s, need: g.k }));
    }
  }
  if (done.length && !need) {
    const recent = [...done].sort((p, q) => (Date.parse(q.updatedAt) || 0) - (Date.parse(p.updatedAt) || 0)).slice(0, 10);
    out.push({ type: "head", key: "h:done", title: l.done, hint: l.doneHint(recent.length), count: recent.length, tone: "done" });
    if (showDone) recent.forEach((item) => out.push({ type: "item", key: `d:${item.id}`, item, section: "done", need: "" }));
  }
  return out;
}

export const publishable = (d: StudioDetail, x: Ctx) => canPublishItem(d, x.a, x.ctor(d.code));

