import { asDict, asStr, type Dict } from "@/shared/lib/json";
import type { OtpChallenge, TwoFactorChallenge } from "../model/types";

export const OTP_TTL_MS = 2 * 60 * 1000;

function expiresAt(d: Dict, fallbackMs: number): number {
  const now = Date.now();
  const raw = d.expires_at ?? d.expiresAt;
  let at = typeof raw === "string" || typeof raw === "number" ? new Date(raw).getTime() : NaN;
  if (Number.isNaN(at)) {
    const s = Number(d.expires_in ?? d.expires_in_seconds ?? d.ttl_seconds);
    if (Number.isFinite(s) && s > 0) at = now + s * 1000;
  }
  const left = at - now;
  if (left > 0 && left <= 60 * 60 * 1000) return now + Math.min(left, OTP_TTL_MS * 5);
  return fallbackMs ? now + fallbackMs : 0;
}

function tgLink(d: Dict): string | undefined {
  const s = asStr(d.telegram_bot_link ?? d.telegram_link ?? d.telegram_url ?? d.bot_link).trim();
  return /^(https:|tg:)\/\//i.test(s) ? s : undefined;
}

export function normOtp(v: unknown, sms = true): OtpChallenge {
  const src = asDict(v);
  const idOf = (x: Dict) => x.verification_id ?? x.verificationId ?? x.challenge_id;
  const d = [src, asDict(src.verification), asDict(src.data), asDict(src.detail)].find((x) => idOf(x) != null) ?? src;
  return {
    verificationId: asStr(idOf(d)),
    phone: asStr(d.phone ?? src.phone),
    expiresAt: expiresAt(d, sms ? OTP_TTL_MS : 0),
    message: [d.message, src.message].find((m): m is string => typeof m === "string") ?? "",
    telegramBotLink: tgLink(src) ?? tgLink(d),
  };
}

export function normChallenge(v: unknown): TwoFactorChallenge {
  const j = asDict(v);
  const dd = asDict(j.detail);
  const raw = asStr(dd.method ?? dd.two_factor_method ?? dd.type ?? j.method ?? j.two_factor_method).toLowerCase();
  const method = /totp|authenticator|app/.test(raw) ? "totp" : /telegram/.test(raw) ? "telegram" : raw ? "sms" : "";
  const o = normOtp(j, method !== "totp");
  const text = (x: unknown) => (typeof x === "string" && x.trim() ? x : "");
  return { ...o, twoFactorRequired: true, method, message: o.message || text(dd.message) || text(j.detail) || text(j.message) };
}
