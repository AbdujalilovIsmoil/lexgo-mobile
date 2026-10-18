import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { SecurityProfile, TwoFactorMethod } from "../model/types";

const methodOf = (raw: string): TwoFactorMethod => {
  const m = raw.toLowerCase();
  return /totp|authenticator|app/.test(m) ? "totp" : m === "sms" ? "sms" : m ? "telegram" : "";
};

// Link state is only known when /auth/me exposes it (undefined = the backend does not say).
function telegramOf(d: Record<string, unknown>): boolean | undefined {
  const tg = asDict(d.telegram);
  for (const v of [d.telegram_linked, d.is_telegram_linked, d.telegram_connected, tg.linked]) if (typeof v === "boolean") return v;
  return "telegram_chat_id" in d ? asStr(d.telegram_chat_id).trim() !== "" : undefined;
}

// GET /auth/me — only the security fields: 2FA state + method and the Telegram link.
export async function getSecurityProfile(): Promise<SecurityProfile> {
  const d = asDict(await http("/auth/me"));
  const tf = asDict(d.two_factor);
  const enabled = Boolean(d.two_factor_enabled ?? d.twofa_enabled ?? tf.enabled);
  const method = methodOf(asStr(d.two_factor_method ?? tf.method));
  return { twoFactorEnabled: enabled, method: enabled ? method || "telegram" : "", telegramLinked: telegramOf(d) };
}
