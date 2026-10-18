import { http, httpRaw, ApiError, parseErrorBody } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { deviceHeaders } from "../lib/deviceLabel";
import { normChallenge, normSession, normUser } from "./normalize";
import type { LoginResult, Session, User } from "../model/types";

// POST /auth/login → tokens, or 428 with a 2FA challenge (Telegram code / authenticator).
export async function login(phone: string, password: string): Promise<LoginResult> {
  const { status, body } = await httpRaw("/auth/login", { method: "POST", body: { phone, password }, auth: false, headers: deviceHeaders() });
  if (status === 428) return normChallenge(body);
  if (status < 200 || status >= 300) throw parseErrorBody(status, body);
  const d = asDict(body);
  if (!asStr(d.access_token ?? d.token) && d.two_factor_required === true) return normChallenge(d);
  return normSession(d);
}

export async function loginVerify2fa(verificationId: string, code: string): Promise<Session> {
  return normSession(await http("/auth/login/2fa", { method: "POST", body: { verification_id: verificationId, code }, auth: false, headers: deviceHeaders() }));
}

export async function me(): Promise<User> {
  return normUser(await http("/auth/me"));
}

// Throws the ApiError as is: the caller decides whether the status means "revoked" or "try later".
export async function refresh(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
  const d = asDict(await http("/auth/refresh", { method: "POST", body: { refresh_token: refreshToken }, auth: false }));
  return { token: asStr(d.access_token ?? d.token), refreshToken: asStr(d.refresh_token ?? refreshToken) };
}

const post = (bearer: string | undefined, rt: string | undefined) =>
  http("/auth/logout", { method: "POST", body: rt ? { refresh_token: rt } : {}, auth: false, headers: bearer ? { Authorization: `Bearer ${bearer}` } : {} });

// Best effort, never throws: revoke the refresh session on the server with the tokens captured at
// sign-out. An expired bearer is rejected before the body is read, so refresh once and retry.
export async function logout(refreshToken: string, token: string): Promise<void> {
  try {
    await post(token || undefined, refreshToken || undefined);
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 401 || !refreshToken) return;
    const fresh = await refresh(refreshToken).catch(() => null);
    await post(fresh?.token || undefined, fresh?.refreshToken || refreshToken).catch(() => {});
  }
}
