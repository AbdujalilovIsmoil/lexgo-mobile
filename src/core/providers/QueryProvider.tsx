import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, focusManager, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { AppState, Platform } from "react-native";
import { ApiError } from "@/shared/api";
import { DAY, keepPublicQueries, persister, shouldPersist } from "./queryPersist";

const BUSTER = "2"; // bump to throw every saved cache away after a response-shape change

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
          refetchOnReconnect: false,
        },
      },
    });
    keepPublicQueries(c);
    return c;
  });
  useEffect(() => {
    onlineManager.setOnline(true);
    const sub = AppState.addEventListener("change", (st) => {
      if (Platform.OS !== "web") focusManager.setFocused(st === "active");
    });
    return () => sub.remove();
  }, []);
  return (
    <PersistQueryClientProvider client={client} persistOptions={{ persister, maxAge: DAY, buster: BUSTER, dehydrateOptions: { shouldDehydrateQuery: shouldPersist } }}>
      {children}
    </PersistQueryClientProvider>
  );
}
