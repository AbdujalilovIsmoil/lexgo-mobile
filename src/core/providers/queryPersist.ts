import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Query, QueryClient } from "@tanstack/react-query";

export const DAY = 24 * 60 * 60 * 1000;

// Public catalogue data only (same for every visitor): it is saved on the phone, so the next launch paints it
// instantly and the backend is asked again only once the data is stale. Nothing user-specific is ever persisted.
// The template catalogue (slim rows, ≈0.5 MB for all ~1000; the raw answers are ≈14 MB and never stored) is public and changes rarely: kept for a day,
// so a launch neither downloads nor parses it again. The heavy per-template queries (detail, render) are not listed on purpose.
const PUBLIC_ROOTS = ["doc-templates", "doc-template-categories", "doc-template-linked", "service-categories", "services", "services-pages", "service-passport", "plans", "market-meta", "promo-active", "lawyers", "lawyers-pages", "lawyer"];

export const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: "lexgo_query_cache", throttleTime: 2000 });

export const shouldPersist = (q: Query): boolean => q.state.status === "success" && PUBLIC_ROOTS.includes(String(q.queryKey[0]));

/** Persisted queries must outlive the in-memory default, otherwise they are dropped before they are written. */
export function keepPublicQueries(client: QueryClient): void {
  for (const root of PUBLIC_ROOTS) client.setQueryDefaults([root], { gcTime: DAY });
}
