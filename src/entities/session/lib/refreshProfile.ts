import { ApiError } from "@/shared/api";
import { me } from "../api/authApi";
import { useSessionStore } from "../model/store";
import { mergeUser } from "./accountState";
import { probeSession } from "./bindHttp";

export type ProfileResult = "ok" | "restricted" | "failed";

let lastAt = 0;
export const profileAge = (): number => Date.now() - lastAt;

// First /auth/refresh: a revoked device keeps a valid access token (7 days) and /auth/me still
// answers, only the refresh endpoint says the session is gone (→ one sign-out + notice). Then
// GET /auth/me → the stored profile (role, assigned roles, permissions, account status, 2FA …).
// A 403 from /auth/me with a live token means the account may not be used: the gate shows it.
// Network errors and 5xx keep what is stored.
export async function refreshProfile(): Promise<ProfileResult> {
  const st = useSessionStore.getState();
  const cur = st.session?.user;
  if (!cur) return "failed";
  await probeSession();
  if (!useSessionStore.getState().session) return "failed";
  try {
    const u = await me();
    const now = useSessionStore.getState().session?.user;
    if (!now || u.id !== now.id) return "failed";
    await useSessionStore.getState().setUser(mergeUser(now, u));
    lastAt = Date.now();
    return "ok";
  } catch (e) {
    if (e instanceof ApiError && e.status === 403 && cur.accountStatus === "active") {
      await st.setUser({ ...cur, accountStatus: "restricted" });
      return "restricted";
    }
    return "failed";
  }
}
