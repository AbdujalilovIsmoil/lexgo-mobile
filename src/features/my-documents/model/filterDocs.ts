import type { DocMode, DocRow } from "@/entities/my-document";
import { groupOf } from "@/entities/my-document";

// "you" = waiting for the client (fill in, pay); review = with the advocates; ready = file delivered.
export type GroupFilter = "" | "you" | "review" | "ready";
export const bucket = (status: string): GroupFilter | "closed" => {
  const g = groupOf(status);
  return g === "draft" || g === "payment" ? "you" : g === "closed" ? "closed" : g;
};

type F = { group: GroupFilter; mode: "" | DocMode; status: string; needle: string };

// The light list holds every document, so filtering it on the phone is exact.
export const filterDocs = (rows: DocRow[], f: F): DocRow[] =>
  rows.filter((r) => {
    if (f.group && bucket(r.status) !== f.group) return false;
    if (f.mode && r.mode !== f.mode) return false;
    if (f.status && r.status !== f.status) return false;
    return !f.needle || `${r.title} ${r.workId} ${r.requestedType} ${r.statusLabel}`.toLowerCase().includes(f.needle);
  });
