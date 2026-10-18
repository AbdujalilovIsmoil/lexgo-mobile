import type { Column, Lead } from "./types";

export const leadsOf = (cols: Column[]): Lead[] => cols.flatMap((c) => c.leads);
export const stageOf = (cols: Column[], id: string): string => cols.find((c) => c.leads.some((l) => l.id === id))?.key ?? "";

// Replace one lead in place (optimistic updates).
export function patchLead(cols: Column[], id: string, fn: (l: Lead) => Lead): Column[] {
  return cols.map((c) => (c.leads.some((l) => l.id === id) ? { ...c, leads: c.leads.map((l) => (l.id === id ? fn(l) : l)) } : c));
}

export function removeLead(cols: Column[], id: string): Column[] {
  return cols.map((c) => (c.leads.some((l) => l.id === id) ? { ...c, count: Math.max(0, c.count - 1), leads: c.leads.filter((l) => l.id !== id) } : c));
}

// The card jumps to `position` of the target column at once; the server call follows.
export function moveLeadTo(cols: Column[], id: string, key: string, position = 0): Column[] {
  const lead = leadsOf(cols).find((l) => l.id === id);
  if (!lead) return cols;
  return removeLead(cols, id).map((c) => {
    if (c.key !== key) return c;
    const leads = c.leads.slice();
    leads.splice(Math.min(position, leads.length), 0, lead);
    return { ...c, count: c.count + 1, leads };
  });
}

// KPI strip numbers, taken from the full board (not the filtered view).
export function boardStats(cols: Column[]) {
  const total = cols.reduce((n, c) => n + c.count, 0);
  const closed = cols.filter((c) => c.isFinal).reduce((n, c) => n + c.count, 0);
  const won = (cols.find((c) => c.key === "won") ?? cols.find((c) => c.isFinal))?.count ?? 0;
  return { total, active: total - closed, won, conv: total ? Math.round((won / total) * 100) : 0 };
}

// Moving into a "lost" column asks for a reason first (same rule as the web).
export const isLostKey = (key: string): boolean => /lost|rejected|yoqotil|rad/i.test(key);
