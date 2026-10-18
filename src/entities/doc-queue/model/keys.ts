import type { QueryClient } from "@tanstack/react-query";

// One prefix for the whole module, so a single invalidate refreshes lists, details and the pool.
export const docKeys = {
  all: ["pro-docs"] as const,
  list: (status: string) => ["pro-docs", "list", status] as const,
  one: (id: string) => ["pro-docs", "one", id] as const,
  pool: ["pro-docs", "pool"] as const,
  sources: (id: string) => ["pro-docs", "sources", id] as const,
  editor: (id: string) => ["pro-docs", "editor", id] as const,
  rating: (id: string) => ["pro-docs", "rating", id] as const,
  candidates: ["pro-docs", "candidates"] as const,
};

// Refresh lists / records / pool after a write — but never the open editor session (it would rebuild the WebView).
export const refreshDocs = (qc: QueryClient): void => void qc.invalidateQueries({ queryKey: docKeys.all, predicate: (q) => q.queryKey[1] !== "editor" });
