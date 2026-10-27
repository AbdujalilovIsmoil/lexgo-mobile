import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, focusManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { AppState, Platform } from "react-native";
import { ApiError } from "@/shared/api";
import { keepPersistedQueries } from "@/shared/cache/gc";
import { DAY, keepPublicQueries, persister, shouldPersist } from "./queryPersist";

const BUSTER = "3"; // bump to throw every saved cache away after a response-shape change (3: plans carry their entitlement contract)

// One shared cache: data stays fresh for 2 minutes (screens reuse it instead of asking again), refetches only happen when
// the app returns to the foreground or the data went stale, 4xx errors are not retried, and public catalogue data is kept on disk.
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const c = new QueryClient({
      defaultOptions: {
        queries: {
          retry: (count, e) => (e instanceof ApiError && e.status > 0 && e.status < 500 ? false : count < 2),
          staleTime: 2 * 60 * 1000,
          gcTime: 30 * 60 * 1000,
          // offlineFirst: the first attempt always runs and cached data is served at once; when the request fails for lack of a
          // connection the query keeps its data (and pauses its retries) instead of turning into an error screen.
          networkMode: "offlineFirst",
          refetchOnReconnect: true, // stale queries reload when the connection returns (fresh ones are left alone)
        },
      },
    });
    keepPublicQueries(c);
    keepPersistedQueries(c);
    return c;
  });
  useEffect(() => {
    const sub = AppState.addEventListener("change", (st) => {
      // Only a real trip to the background counts as leaving: Control Center, a system alert or Face ID ("inactive") must not refetch everything.
      if (Platform.OS !== "web") focusManager.setFocused(st !== "background");
    });
    return () => sub.remove();
  }, []);
  return (
    <PersistQueryClientProvider client={client} persistOptions={{ persister, maxAge: DAY, buster: BUSTER, dehydrateOptions: { shouldDehydrateQuery: shouldPersist, shouldDehydrateMutation: () => false } }}>
      {children}
    </PersistQueryClientProvider>
  );
}
