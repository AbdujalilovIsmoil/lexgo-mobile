import type { IconName } from "@/shared/ui/Icon";
import type { ActivityEntry, SecurityEvent } from "../model/types";

// The "Journal" tab shows the audit log and the security events as ONE timeline. Everything below is pure
// (no React, no i18n) so it can be unit-tested: kinds, filters, day grouping and the paging window.

export const JOURNAL_KINDS = ["auth", "protect", "orders", "documents", "profile", "alerts", "other"] as const;
export type JournalKind = (typeof JOURNAL_KINDS)[number];
export type JournalPeriod = "all" | "today" | "7d" | "30d";
export const JOURNAL_PERIODS: JournalPeriod[] = ["all", "today", "7d", "30d"];
export const JOURNAL_PAGE = 10;

export type JournalEntry = {
  id: string;
  source: "activity" | "event";
  kind: JournalKind;
  key: string; // action / event type, for the title lookup
  title: string; // server title (uz) or free text, if any
  detail: string;
  ip: string;
  fromIp: string;
  agent: string;
  outcome: string;
  failed: boolean;
  createdAt: string;
  ts: number;
};

export type JournalFilter = { kinds: JournalKind[]; period: JournalPeriod; q: string };
export const EMPTY_FILTER: JournalFilter = { kinds: [], period: "all", q: "" };

const ACTIVITY_RULES: [JournalKind, RegExp][] = [
  ["protect", /2fa|two_factor|password|telegram|session_revoke|otp/i],
  ["auth", /login|logout|session|refresh/i],
  ["orders", /order|milestone|payment|refund|contract|case|subscription|gift/i],
  ["documents", /document|file|template|download|upload/i],
  ["profile", /profile|lawyer|consent|verification|settings|notification/i],
];
export const kindOfActivity = (action: string): JournalKind => ACTIVITY_RULES.find(([, re]) => re.test(action))?.[0] ?? "other";

const BAD = /block|fail|denied|suspicious|danger/i;

export function kindOfEvent(type: string, status = ""): JournalKind {
  if (BAD.test(`${type} ${status}`)) return "alerts";
  if (/password|2fa|two_factor/i.test(type)) return "protect";
  if (/login/i.test(type)) return "auth";
  return "alerts";
}

export type KindTone = "accent" | "ok" | "cy" | "warn" | "gray" | "err";
const LOOK: Record<JournalKind, { icon: IconName; tone: KindTone }> = {
  auth: { icon: "log-in", tone: "accent" },
  protect: { icon: "shield", tone: "ok" },
  orders: { icon: "shopping-bag", tone: "cy" },
  documents: { icon: "file-text", tone: "warn" },
  profile: { icon: "user", tone: "gray" },
  alerts: { icon: "alert-triangle", tone: "err" },
  other: { icon: "activity", tone: "gray" },
};
export const kindIcon = (k: JournalKind) => LOOK[k].icon;
export const kindTone = (k: JournalKind) => LOOK[k].tone;

const ts = (iso: string) => {
  const n = Date.parse(iso);
  return Number.isFinite(n) ? n : 0;
};

export function fromActivity(a: ActivityEntry): JournalEntry {
  return {
    id: `a:${a.id}`, source: "activity", kind: kindOfActivity(a.action), key: a.action, title: a.titleUz, detail: a.descriptionUz || a.detail,
    ip: a.ip, fromIp: "", agent: "", outcome: a.outcome, failed: !!a.outcome && !/^(success|ok)$/i.test(a.outcome), createdAt: a.createdAt, ts: ts(a.createdAt),
  };
}

export function fromEvent(e: SecurityEvent): JournalEntry {
  return {
    id: `e:${e.id}`, source: "event", kind: kindOfEvent(e.type, e.status), key: e.type, title: e.title, detail: "",
    ip: e.ip, fromIp: e.fromIp, agent: e.agent, outcome: e.status, failed: BAD.test(`${e.type} ${e.status}`), createdAt: e.createdAt, ts: ts(e.createdAt),
  };
}

export const mergeJournal = (activity: ActivityEntry[], events: SecurityEvent[]): JournalEntry[] =>
  [...activity.map(fromActivity), ...events.map(fromEvent)].sort((a, b) => b.ts - a.ts);

export const startOfDay = (t: number): number => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function inPeriod(t: number, period: JournalPeriod, now = Date.now()): boolean {
  if (period === "all") return true;
  const from = startOfDay(now) - (period === "today" ? 0 : period === "7d" ? 6 : 29) * 86_400_000;
  return t >= from;
}

const hay = (e: JournalEntry) => `${e.key} ${e.title} ${e.detail} ${e.ip} ${e.fromIp} ${e.agent}`.toLowerCase();

function matches(e: JournalEntry, f: JournalFilter, now: number, skipKinds = false): boolean {
  if (!skipKinds && f.kinds.length && !f.kinds.includes(e.kind)) return false;
  if (!inPeriod(e.ts, f.period, now)) return false;
  const q = f.q.trim().toLowerCase();
  return !q || hay(e).includes(q);
}

export const filterJournal = (all: JournalEntry[], f: JournalFilter, now = Date.now()): JournalEntry[] => all.filter((e) => matches(e, f, now));

// Per-kind counts under the period + search, ignoring the kind selection (what each tile in the filter sheet would add).
export function countKinds(all: JournalEntry[], f: JournalFilter, now = Date.now()): Record<JournalKind, number> {
  const n = Object.fromEntries(JOURNAL_KINDS.map((k) => [k, 0])) as Record<JournalKind, number>;
  for (const e of all) if (matches(e, f, now, true)) n[e.kind] += 1;
  return n;
}

export const toggleKind = (kinds: JournalKind[], k: JournalKind): JournalKind[] => (kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k]);

export type FilterChip = { id: string; type: "kind"; kind: JournalKind } | { id: string; type: "period"; period: JournalPeriod };

// The removable chips under the search row: one per selected kind plus the period, when it is not "all".
export function filterChips(f: JournalFilter): FilterChip[] {
  const chips: FilterChip[] = f.kinds.map((kind) => ({ id: `k:${kind}`, type: "kind", kind }));
  if (f.period !== "all") chips.push({ id: "period", type: "period", period: f.period });
  return chips;
}

export const removeChip = (f: JournalFilter, c: FilterChip): JournalFilter => (c.type === "kind" ? { ...f, kinds: f.kinds.filter((k) => k !== c.kind) } : { ...f, period: "all" });
export const activeFilterCount = (f: JournalFilter): number => filterChips(f).length;
export const hasAnyFilter = (f: JournalFilter): boolean => activeFilterCount(f) > 0 || f.q.trim() !== "";

export type DayKey = { kind: "today" | "yesterday" } | { kind: "date"; iso: string };
export type DayGroup = { id: string; day: DayKey; entries: JournalEntry[] };

const pad = (n: number) => String(n).padStart(2, "0");
const localIso = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function dayOf(t: number, now = Date.now()): DayKey {
  const diff = Math.round((startOfDay(now) - startOfDay(t)) / 86_400_000);
  if (diff === 0) return { kind: "today" };
  if (diff === 1) return { kind: "yesterday" };
  return { kind: "date", iso: t > 0 ? localIso(t) : "" };
}

// Consecutive entries of the same calendar day share a group (the input is already newest first).
export function groupByDay(entries: JournalEntry[], now = Date.now()): DayGroup[] {
  const out: DayGroup[] = [];
  for (const e of entries) {
    const day = dayOf(e.ts, now);
    const id = day.kind === "date" ? day.iso : day.kind;
    const last = out[out.length - 1];
    if (last && last.id === id) last.entries.push(e);
    else out.push({ id, day, entries: [e] });
  }
  return out;
}

// Client windowing: the backend returns the whole log, so the screen reveals it 10 at a time.
export function pageWindow(total: number, shown: number, size = JOURNAL_PAGE) {
  const count = Math.min(Math.max(shown, 0), total);
  const remaining = total - count;
  return { count, remaining, next: Math.min(size, remaining), hasMore: remaining > 0 };
}
