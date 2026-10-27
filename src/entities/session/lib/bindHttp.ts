import { bindAuth } from "@/shared/api";
import { refresh } from "../api/authApi";
import { useSessionStore } from "../model/store";
import { makeRefresher } from "./refreshPolicy";

const st = () => useSessionStore.getState();

const renew = makeRefresher({ current: () => st().session, refresh, save: (token, refreshToken) => st().setTokens(token, refreshToken), expire: () => st().signOut(true) });

// The one way the session is renewed: the HTTP layer's 401 handler and the "is this session still alive?" probe at start / on return
// to the app both go through it, one request at a time, and both keep the tokens the server answers with. The probe used to drop them:
// when the server rotates the refresh token, the old one it kept was dead, and the next renewal signed the user out ("session expired").
// Two renewals at once with the same refresh token could also see the second one refused as a reuse. Signs out ONLY when /auth/refresh
// says the session is dead (400/401/403).
let running: Promise<string | null> | null = null;
export const refreshSession = (): Promise<string | null> => (running ??= renew().finally(() => { running = null; }));

// Wire the framework-free HTTP layer to the session store: bearer source + the refresher.
export function bindSessionToHttp(): void {
  bindAuth(() => st().session?.token ?? null, refreshSession);
}
