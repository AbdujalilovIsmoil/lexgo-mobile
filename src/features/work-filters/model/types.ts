import type { WorkGroup, WorkKind } from "@/entities/work";

// "open" = queue + active + review (what the Home counter calls active works); "running" = active + review (someone is working on it, the
// client waits for nothing).
export type GroupFilter = WorkGroup | "open" | "running" | "all";
export type KindFilter = WorkKind | "all";
export type WorkFilters = { q: string; kind: KindFilter; group: GroupFilter };
