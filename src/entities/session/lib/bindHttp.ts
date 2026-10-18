import { bindAuth } from "@/shared/api";
import { refresh } from "../api/authApi";
import { useSessionStore } from "../model/store";
import { makeRefresher } from "./refreshPolicy";

const st = () => useSessionStore.getState();

const deps = { current: () => st().session, refresh, expire: () => st().signOut(true) };

// The HTTP layer's 401 handler: swaps in the new tokens, or signs the user out ONLY when
// /auth/refresh says the session is dead (400/401/403).
export const refreshSession = makeRefresher({ ...deps, save: (token, refreshToken) => st().setTokens(token, refreshToken) });

// The periodic "is this session still alive?" probe (app start / foreground). Same sign-out rule, but
// the answer's new access token is dropped: the stored one is still valid, and swapping it would
// reconnect the user socket and re-sync every query for nothing.
export const probeSession = makeRefresher({ ...deps, save: async () => {} });

// Wire the framework-free HTTP layer to the session store: bearer source + the refresher.
export function bindSessionToHttp(): void {
  bindAuth(() => st().session?.token ?? null, refreshSession);
}
