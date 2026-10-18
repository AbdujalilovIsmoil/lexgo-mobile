import type { WorkGroup, WorkKind } from "@/entities/work";

// "open" = queue + active + review (what the Home counter calls active works).
export type GroupFilter = WorkGroup | "open" | "all";
export type KindFilter = WorkKind | "all";
export type WorkFilters = { q: string; kind: KindFilter; group: GroupFilter };
