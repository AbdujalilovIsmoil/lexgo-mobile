import { isoDay } from "@/shared/lib/format";
import type { Lead, LeadFilter } from "./types";

export const EMPTY_FILTER: LeadFilter = { q: "", region: "", source: "", score: "", urgency: "", assignee: "", from: "", to: "" };
export const filterActive = (f: LeadFilter): boolean => Object.values(f).some((v) => v !== "");
// Filters set in the sheet (the search box has its own field), for the badge on the filter button.
export const sheetFilterCount = (f: LeadFilter): number => Object.entries(f).filter(([k, v]) => k !== "q" && k !== "to" && v !== "").length;

// Local calendar day of a server timestamp ("" when unusable).
export function leadDay(createdAt: string): string {
  const d = new Date(createdAt);
  return Number.isNaN(d.getTime()) ? "" : isoDay(d);
}

const norm = (v: string) => v.trim().toLowerCase();

export function leadMatches(l: Lead, f: LeadFilter, meId: string): boolean {
  const q = f.q.trim().toLowerCase();
  if (q && !`${l.name} ${l.phone} ${l.category} ${l.note} ${l.workId}`.toLowerCase().includes(q)) return false;
  if (f.region && norm(l.region) !== f.region) return false;
  if (f.source && norm(l.source) !== f.source) return false;
  if (f.score && l.score !== f.score) return false;
  if (f.urgency && norm(l.urgency) !== f.urgency) return false;
  if (f.assignee === "unassigned") {
    if (l.assignedTo) return false;
  } else if (f.assignee === "mine") {
    if (!meId || l.assignedTo !== meId) return false;
  } else if (f.assignee && l.assignedTo !== f.assignee) return false;
  if (f.from || f.to) {
    const day = leadDay(l.createdAt);
    if (!day || (f.from && day < f.from) || (f.to && day > f.to)) return false;
  }
  return true;
}

// Distinct non-empty values for a filter dropdown.
export const distinct = (leads: Lead[], pick: (l: Lead) => string): string[] => [...new Set(leads.map((l) => norm(pick(l))).filter(Boolean))];
