import { readJson, readSecret, writeJson, writeSecret } from "@/shared/lib/storage";
import type { Session, User } from "./types";

// Tokens (and the device-session id) live in SecureStore, the non-secret profile in AsyncStorage.
const TOKEN = "lexgo_token";
const REFRESH = "lexgo_refresh";
const USER = "lexgo_user";
const SID = "lexgo_sid";

export async function readSession(): Promise<Session | null> {
  const [token, refreshToken, user, sid] = await Promise.all([readSecret(TOKEN), readSecret(REFRESH), readJson<User>(USER), readSecret(SID)]);
  // Users stored by an older build have no roles/permissions yet.
  return token && user ? { token, refreshToken: refreshToken ?? "", sid: sid ?? undefined, user: { ...user, roles: user.roles ?? [], permissions: user.permissions ?? [] } } : null;
}

export const writeSession = (s: Session) =>
  Promise.all([writeSecret(TOKEN, s.token), writeSecret(REFRESH, s.refreshToken), writeSecret(SID, s.sid ?? null), writeJson(USER, s.user)]);

export const wipeSession = () => Promise.all([writeSecret(TOKEN, null), writeSecret(REFRESH, null), writeSecret(SID, null), writeJson(USER, null)]);
export const writeTokens = (token: string, refreshToken: string) => Promise.all([writeSecret(TOKEN, token), writeSecret(REFRESH, refreshToken)]);
export const writeUser = (user: User) => writeJson(USER, user);
export const writeSid = (sid: string) => writeSecret(SID, sid);
