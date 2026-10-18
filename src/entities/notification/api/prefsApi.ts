import { http } from "@/shared/api";
import { asDict } from "@/shared/lib/json";

export const PREF_KEYS = ["push", "sms", "telegram", "email", "orders", "payments", "messages", "marketing"] as const;
export type PrefKey = (typeof PREF_KEYS)[number];
export type Prefs = Record<PrefKey, boolean>;

// A key the server never stored reads as these defaults (same as a fresh account).
export const PREF_DEFAULTS: Prefs = { push: true, sms: true, telegram: false, email: false, orders: true, payments: true, messages: true, marketing: false };

function flag(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return /^(true|1|on|yes|enabled)$/i.test(v.trim()) ? true : /^(false|0|off|no|disabled)$/i.test(v.trim()) ? false : undefined;
  const o = asDict(v);
  return Object.keys(o).length ? flag(o.enabled ?? o.on ?? o.value) : undefined;
}

// GET /notifications/preferences — flat booleans (+ stray fields such as work_id, ignored).
export async function getPrefs(): Promise<Prefs> {
  const d = asDict(await http("/notifications/preferences"));
  const ch = asDict(d.channels);
  return Object.fromEntries(PREF_KEYS.map((k) => [k, flag(d[k]) ?? flag(ch[k]) ?? PREF_DEFAULTS[k]])) as Prefs;
}

// The server merges what it gets, but GET then returns ONLY the stored keys; always send the whole
// set so every switch stays explicit.
export async function putPrefs(p: Prefs): Promise<void> {
  await http("/notifications/preferences", { method: "PUT", body: p });
}
