import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { OtpStart, TotpSetup } from "../model/types";
import { deadline } from "./deadline";

// POST /auth/2fa/start → a 6-digit code goes to the Telegram bot (or SMS when no bot chat is linked).
export async function start2fa(): Promise<OtpStart> {
  const d = asDict(await http("/auth/2fa/start", { method: "POST", body: {} }));
  return { verificationId: asStr(d.verification_id ?? d.verificationId), expiresAt: deadline(d.expires_at) };
}

export async function verify2fa(verificationId: string, code: string): Promise<void> {
  await http("/auth/2fa/verify", { method: "POST", body: { verification_id: verificationId, code } });
}

// DELETE /auth/2fa — 403 for roles that must keep 2FA on.
export async function disable2fa(): Promise<void> {
  await http("/auth/2fa", { method: "DELETE" });
}

// The QR arrives as a data:image PNG (or a bare base64 PNG / https URL).
function qrSrc(v: unknown): string {
  const s = asStr(v).trim();
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(s) || /^https:\/\//i.test(s)) return s;
  return s.length > 64 && /^[A-Za-z0-9+/=\s]+$/.test(s) ? `data:image/png;base64,${s.replace(/\s+/g, "")}` : "";
}

// POST /auth/2fa/totp/setup → { setup_id, secret, otpauth_url, qr_code }.
export async function setupTotp(): Promise<TotpSetup> {
  const d = asDict(await http("/auth/2fa/totp/setup", { method: "POST", body: {} }));
  const uri = asStr(d.otpauth_url ?? d.otpauth_uri ?? d.provisioning_uri ?? d.uri).trim();
  const otpauthUrl = /^otpauth:\/\//i.test(uri) ? uri : "";
  let secret = asStr(d.secret).trim();
  if (!secret) secret = /[?&]secret=([^&#]+)/i.exec(otpauthUrl)?.[1] ?? "";
  return { setupId: asStr(d.setup_id ?? d.id ?? d.verification_id), secret, otpauthUrl, qrCode: qrSrc(d.qr_code ?? d.qr_code_url ?? d.qr) };
}

export async function enableTotp(setupId: string, code: string): Promise<void> {
  await http("/auth/2fa/totp/enable", { method: "POST", body: { setup_id: setupId, code } });
}
