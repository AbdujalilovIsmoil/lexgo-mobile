import { asArr, asDict, asStr } from "@/shared/lib/json";
import { fromBackendRole, type Session, type User } from "../model/types";

export { OTP_TTL_MS, normOtp, normChallenge } from "./normalizeOtp";

const opt = (v: unknown): string | undefined => asStr(v).trim() || undefined;

// GET /auth/me and the `user` of AuthResponse (UserOut).
export function normUser(v: unknown): User {
  const d = asDict(v);
  const raw = asStr(d.role).toLowerCase();
  const tf = asDict(d.two_factor);
  const tg = asDict(d.telegram);
  return {
    id: asStr(d.id ?? d.user_id),
    lexgoId: opt(d.lexgo_id ?? d.lexgoId),
    name: asStr(d.name),
    firstName: opt(d.first_name),
    lastName: opt(d.last_name),
    middleName: opt(d.middle_name),
    region: opt(d.region),
    phone: asStr(d.phone),
    role: fromBackendRole(raw),
    backendRole: raw || "client",
    accountStatus: asStr(d.account_status ?? d.status, "active").trim().toLowerCase() || "active",
    roles: asArr(d.roles).map((r) => asStr(r).trim().toLowerCase()).filter(Boolean),
    permissions: asArr(d.permissions).map((r) => asStr(r).trim()).filter(Boolean),
    twoFactorEnabled: Boolean(d.two_factor_enabled ?? d.twofa_enabled ?? tf.enabled),
    twoFactorMethod: opt(d.two_factor_method ?? tf.method),
    phoneVerified: typeof d.phone_verified === "boolean" ? d.phone_verified : undefined,
    telegramLinked: typeof d.telegram_linked === "boolean" ? d.telegram_linked : typeof tg.linked === "boolean" ? tg.linked : undefined,
    createdAt: opt(d.created_at),
  };
}

export function normSession(v: unknown): Session {
  const d = asDict(v);
  return {
    token: asStr(d.access_token ?? d.token),
    refreshToken: asStr(d.refresh_token ?? d.refreshToken),
    user: normUser(d.user ?? d),
  };
}
