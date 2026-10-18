import { useMemo } from "react";
import { leadMatches, filterActive } from "./filter";
import type { Column, Lead, LeadFilter } from "./types";

export type Row = { lead: Lead; col: Column };

// The board after the client-side filters, and the rows of the chosen stage ("" = all stages).
export function useBoardView(cols: Column[], f: LeadFilter, meId: string, stage: string) {
  return useMemo(() => {
    const filtered = filterActive(f);
    const shown = cols.map((c) => ({ ...c, leads: c.leads.filter((l) => leadMatches(l, f, meId)) }));
    const rows: Row[] = (stage ? shown.filter((c) => c.key === stage) : shown).flatMap((c) => c.leads.map((lead) => ({ lead, col: c })));
    const counts = shown.map((c) => (filtered ? c.leads.length : c.count));
    return { filtered, shown, rows, counts, matched: shown.reduce((n, c) => n + c.leads.length, 0) };
  }, [cols, f, meId, stage]);
}
