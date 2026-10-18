import { stageOf, type Stage } from "./rules";
import type { UrgentRequest } from "./requestTypes";

// How much an advocate still has to do about a record: a room that is open now, then a time somebody expects them
// at, then work in hand, then the finished. Unknown statuses sit in the middle so a new backend state never sinks.
const RANK: Record<string, number> = { meeting_active: 0, scheduled: 1, claimed: 2, in_progress: 2, open_pool: 3, completed: 9, cancelled: 9, expired: 9 };
const rank = (r: UrgentRequest): number => RANK[r.status] ?? 5;
const when = (r: UrgentRequest): number => Date.parse(r.scheduledAt) || Infinity;
const made = (r: UrgentRequest): number => Date.parse(r.createdAt) || 0;

export function byAttention(list: UrgentRequest[]): UrgentRequest[] {
  return [...list].sort((a, b) => rank(a) - rank(b) || (rank(a) < 9 ? when(a) - when(b) || made(b) - made(a) : made(b) - made(a)));
}

export type StageFilter = Stage | "";

// Case-folded text match on the fields a person remembers: client, work id, situation, service.
export function matches(r: UrgentRequest, q: string): boolean {
  const s = q.trim().toLowerCase();
  return !s || [r.clientName, r.clientPhone, r.workId, r.need, r.serviceTitle].some((v) => v.toLowerCase().includes(s));
}

export function filterList(list: UrgentRequest[], stage: StageFilter, q: string, kind = ""): UrgentRequest[] {
  return list.filter((r) => (!stage || stageOf(r) === stage) && (!kind || r.serviceKind === kind) && matches(r, q));
}
