import type { ExpPosition, ExpPositionInput } from "../model/types";

type Span = { start: string; end: string; current: boolean }; // days as YYYY-MM-DD
const cmp = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);
const OPEN = "9999-12-31"; // a position held now ends after every real date
// Newest first: a position held now, then the one that ended last, then the one that began last.
const newer = (a: Span, b: Span) => cmp(b.current ? OPEN : b.end || b.start, a.current ? OPEN : a.end || a.start) || cmp(b.start, a.start);

const day = (iso: string) => iso.slice(0, 10);
const spanOf = (p: ExpPosition): Span => ({ start: day(p.startedAt), end: day(p.endedAt), current: p.isCurrent });
const inputSpan = (p: ExpPositionInput): Span => ({ start: p.startedOn, end: p.endedOn, current: p.isCurrent });

export const newestFirst = (list: ExpPosition[]): ExpPosition[] => [...list].sort((a, b) => newer(spanOf(a), spanOf(b)));

// The row an older backend reads as the record's single position: the one held now, else the newest (-1 for no rows).
export function headIndex(list: ExpPositionInput[]): number {
  let best = -1;
  list.forEach((p, i) => {
    if (best < 0 || newer(inputSpan(p), inputSpan(list[best])) < 0) best = i;
  });
  return best;
}

// "2019 – 2022", "2022 – hozirgacha", or "2021" for a position begun and ended in the same year. The year is read from the date as
// written (a calendar day the form sends at midnight UTC), so no time zone moves it into the year before.
export function periodOf(p: ExpPosition, now: string): string {
  const from = p.startedAt.slice(0, 4) || "—";
  if (p.isCurrent) return `${from} – ${now}`;
  const to = p.endedAt.slice(0, 4) || "—";
  return from === to ? from : `${from} – ${to}`;
}

// Positions a revision added, removed or edited, by title ("Advokat → Katta advokat" for a renamed one).
export type ExpPosDiff = { added: string[]; removed: string[]; edited: string[] };
export const noPosDiff = (): ExpPosDiff => ({ added: [], removed: [], edited: [] });

const name = (p: ExpPosition) => p.title.trim() || "—";
const low = (p: ExpPosition) => p.title.trim().toLowerCase();
const sameSpan = (a: Span, b: Span) => a.start === b.start && a.current === b.current && (a.current || a.end === b.end);
const unchanged = (a: ExpPosition, b: ExpPosition) => a.title.trim() === b.title.trim() && sameSpan(spanOf(a), spanOf(b)) && a.description.trim() === b.description.trim();

// How the positions of a revision differ from the earlier one's. The order does not count. A position kept as it was is not named; one
// found again by its title (or, renamed, by its start day) was edited; the rest were added or removed.
export function positionDiff(was: ExpPosition[], now: ExpPosition[]): ExpPosDiff {
  const pool = [...was];
  const take = (ok: (x: ExpPosition) => boolean): ExpPosition | null => {
    const i = pool.findIndex(ok);
    return i < 0 ? null : pool.splice(i, 1)[0];
  };
  const out = noPosDiff();
  const changed: ExpPosition[] = [];
  for (const p of now) if (!take((x) => unchanged(x, p))) changed.push(p);
  const unmatched: ExpPosition[] = [];
  for (const p of changed) {
    if (take((x) => low(x) === low(p))) out.edited.push(name(p));
    else unmatched.push(p);
  }
  for (const p of unmatched) {
    const old = day(p.startedAt) ? take((x) => day(x.startedAt) === day(p.startedAt)) : null;
    if (old) out.edited.push(`${name(old)} → ${name(p)}`);
    else out.added.push(name(p));
  }
  out.removed = pool.map(name);
  return out;
}
