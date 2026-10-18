import { isoDay } from "@/shared/lib/format";
import type { BoardColumn, BoardLead, LeadFilter } from "./boardTypes";

export const filterActive = (f: LeadFilter): boolean => Object.values(f).some((v) => v !== "");

// Client-side filters of the board (search, region, score, assignee, created-day range).
export function leadMatches(l: BoardLead, f: LeadFilter, meId: string): boolean {
  const q = f.q.trim().toLowerCase();
  if (q && !`${l.name} ${l.phone} ${l.category} ${l.workId}`.toLowerCase().includes(q)) return false;
  if (f.region && l.region !== f.region) return false;
  if (f.score && l.score !== f.score) return false;
  if (f.assignee === "unassigned" ? l.assignedTo : f.assignee === "mine" ? !meId || l.assignedTo !== meId : f.assignee && l.assignedTo !== f.assignee) return false;
  if (f.from || f.to) {
    const t = Date.parse(l.createdAt);
    const day = Number.isFinite(t) ? isoDay(new Date(t)) : "";
    if (!day || (f.from && day < f.from) || (f.to && day > f.to)) return false;
  }
  return true;
}

// Optimistic move: the card leaves its column and heads the target one.
export function moveInBoard(cols: BoardColumn[], leadId: string, key: string): BoardColumn[] {
  const card = cols.flatMap((c) => c.cards).find((l) => l.id === leadId);
  if (!card) return cols;
  return cols.map((c) => {
    const had = c.cards.some((l) => l.id === leadId);
    if (c.key === key) return had ? c : { ...c, count: c.count + 1, cards: [card, ...c.cards] };
    return had ? { ...c, count: Math.max(0, c.count - 1), cards: c.cards.filter((l) => l.id !== leadId) } : c;
  });
}
