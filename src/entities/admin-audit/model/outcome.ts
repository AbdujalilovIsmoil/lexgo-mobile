import type { AuditEntry } from "./types";

export type OutcomeKind = "ok" | "bad" | "other";
const BAD = /fail|deni|error|block|reject/i;

// success (or no outcome) = ok, failures / denials / blocks = bad, anything else = other.
export const outcomeKind = (e: Pick<AuditEntry, "outcome">): OutcomeKind => (!e.outcome || e.outcome === "success" ? "ok" : BAD.test(e.outcome) ? "bad" : "other");

// Client-side narrowing of the loaded log: outcome kind ("all" keeps everything) plus a word match over every visible field.
export function filterAudit(rows: AuditEntry[], kind: string, q: string): AuditEntry[] {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (kind === "all" && !words.length) return rows;
  return rows.filter((e) => (kind === "all" || outcomeKind(e) === kind) && words.every((w) => `${e.action} ${e.detail} ${e.titleUz} ${e.ip} ${e.userId} ${e.targetType} ${e.targetId}`.toLowerCase().includes(w)));
}
