import { http, ApiError } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { deviceHeaders } from "../lib/deviceLabel";
import { normOtp, normSession } from "./normalize";
import type { OtpChallenge, RegisterVerifyResult } from "../model/types";

export type RegisterInput = {
  role: string;
  name: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  region?: string;
  referralCode?: string;
  phone: string;
  password: string;
};

// POST /auth/register/start → { verification_id, expires_at, telegram_bot_link, message }; the code
// itself is only ever delivered by the Telegram bot. 409 = phone taken, 429 = cooldown / blocked.
export async function registerStart(i: RegisterInput): Promise<OtpChallenge> {
  const body = {
    role: i.role,
    name: i.name,
    phone: i.phone,
    password: i.password,
    ...(i.firstName ? { first_name: i.firstName } : {}),
    ...(i.lastName ? { last_name: i.lastName } : {}),
    ...(i.middleName ? { middle_name: i.middleName } : {}),
    ...(i.region ? { region: i.region } : {}),
    ...(i.referralCode ? { referral_code: i.referralCode } : {}),
  };
  return normOtp(await http("/auth/register/start", { method: "POST", body, auth: false }));
}

// Tokens → session. No tokens: a 2FA role has to sign in (`loginRequired`), otherwise the request is
// waiting for an admin (`pending`).
export async function registerVerify(verificationId: string, code: string): Promise<RegisterVerifyResult> {
  let raw: unknown;
  try {
    raw = await http("/auth/register/verify", { method: "POST", body: { verification_id: verificationId, code }, auth: false, headers: deviceHeaders() });
  } catch (e) {
    if (e instanceof ApiError && e.status === 428) return { kind: "loginRequired", message: e.detail || "" };
    throw e;
  }
  const d = asDict(raw);
  if (asStr(d.access_token ?? d.token)) return { kind: "session", session: normSession(d) };
  if (d.two_factor_required === true || asDict(d.detail).two_factor_required === true) return { kind: "loginRequired", message: asStr(d.message) };
  return { kind: "pending", message: asStr(d.message), status: asStr(d.status, "pending"), role: asStr(d.role) };
}

export async function forgotPassword(phone: string): Promise<OtpChallenge> {
  return normOtp(await http("/auth/password/forgot", { method: "POST", body: { phone }, auth: false }));
}

export async function resetPassword(verificationId: string, code: string, password: string): Promise<void> {
  await http("/auth/password/reset", { method: "POST", body: { verification_id: verificationId, code, password }, auth: false });
}
