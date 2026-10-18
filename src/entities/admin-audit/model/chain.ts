import type { AuditEntry, Chain, ChainState } from "./types";

const norm = (h: string) => h.trim().toLowerCase();
const isGenesis = (h: string) => !h || /^0+$/.test(h) || h === "genesis";
export const shortHash = (h: string) => (h.length > 12 ? `${h.slice(0, 10)}…` : h);

// Chain continuity as far as this list can show it. It only confirms that a row's previous_hash
// equals the event_hash of another row actually received; hashes are never recomputed, so a
// missing link means "not verifiable in this view" (filter, a record outside the list), not "tampered".
export function chainOf(rows: AuditEntry[]): Chain {
  const ev = rows.map((r) => norm(r.eventHash));
  const prev = rows.map((r) => norm(r.previousHash));
  // The list order is not documented: use the direction whose neighbours link more often.
  let down = 0;
  let up = 0;
  prev.forEach((p, i) => {
    if (!p) return;
    if (i + 1 < rows.length && p === ev[i + 1]) down++;
    if (i > 0 && p === ev[i - 1]) up++;
  });
  let newestFirst = down >= up;
  if (down === up && rows.length > 1) newestFirst = Date.parse(rows[0].createdAt) >= Date.parse(rows[rows.length - 1].createdAt);
  const counts = new Map<string, number>();
  for (const h of ev) if (h) counts.set(h, (counts.get(h) ?? 0) + 1);
  const states: ChainState[] = rows.map((_, i) => {
    if (!ev[i]) return "none";
    if (isGenesis(prev[i])) return "genesis";
    const j = newestFirst ? i + 1 : i - 1;
    if (j >= 0 && j < rows.length && ev[j] === prev[i]) return "linked";
    return (counts.get(prev[i]) ?? 0) - (ev[i] === prev[i] ? 1 : 0) > 0 ? "linkedFar" : "outside";
  });
  const count = (...s: ChainState[]) => states.filter((x) => s.includes(x)).length;
  const hashed = rows.length - count("none");
  return { states, hashed, linked: count("linked", "linkedFar"), total: hashed - count("genesis") };
}
