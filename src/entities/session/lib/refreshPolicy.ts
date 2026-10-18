import { ApiError } from "@/shared/api";
import type { Session } from "../model/types";

// /auth/refresh answering 400/401/403 means the refresh token is dead (revoked, expired, account
// inactive). Network errors (status 0), 429 and 5xx are NOT: the session survives, the request fails.
export const isRevoked = (e: unknown): boolean => e instanceof ApiError && (e.status === 400 || e.status === 401 || e.status === 403);

// RefreshRequest.refresh_token: minLength 20 (TZ 47.139); real tokens are 64 characters.
const MIN_REFRESH_LEN = 20;

export type RefreshDeps = {
  current: () => Session | null;
  refresh: (refreshToken: string) => Promise<{ token: string; refreshToken: string }>;
  save: (token: string, refreshToken: string) => Promise<void>;
  expire: () => Promise<void>;
};

const sameUser = (a: Session, b: Session) => !!a.user.id && a.user.id === b.user.id;

// One refresh attempt (http() already single-flights concurrent 401s into one call of this).
// Resolves to a working access token of the SAME account, or null; signs out only when revoked.
export function makeRefresher(d: RefreshDeps): () => Promise<string | null> {
  return async () => {
    const cur = d.current();
    if (!cur) return null;
    if (cur.refreshToken.length < MIN_REFRESH_LEN) {
      await d.expire(); // missing / corrupted: the server would answer 422, it can never be renewed
      return null;
    }
    let next: { token: string; refreshToken: string };
    try {
      next = await d.refresh(cur.refreshToken);
    } catch (e) {
      const now = d.current();
      if (!now) return null; // signed out meanwhile
      if (now.refreshToken !== cur.refreshToken) return sameUser(now, cur) ? now.token : null; // re-login / rotation meanwhile
      if (isRevoked(e)) await d.expire();
      return null;
    }
    const now = d.current();
    if (!next.token || !now || !sameUser(now, cur)) return null;
    if (now.refreshToken !== cur.refreshToken) return now.token;
    await d.save(next.token, next.refreshToken);
    return next.token;
  };
}
