import { http } from "@/shared/api";
import { asDict } from "@/shared/lib/json";
import { NOTIF_KEYS, type NotifKey, type NotifPrefs } from "../model/types";

// A flag may arrive as a boolean, 0/1, "on"/"true" or { enabled }; anything else is no answer.
function on(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return /^(true|1|on|yes|enabled)$/i.test(v.trim()) ? true : /^(false|0|off|no|disabled)$/i.test(v.trim()) ? false : undefined;
  const o = asDict(v);
  return Object.keys(o).length ? on(o.enabled ?? o.on ?? o.value) : undefined;
}

// GET /notifications/preferences — flat flags (channels may also be nested under channels/events).
export async function getNotifPrefs(): Promise<NotifPrefs> {
  const d = asDict(await http("/notifications/preferences"));
  const ch = asDict(d.channels);
  const ev = asDict(d.events ?? d.categories);
  return Object.fromEntries(NOTIF_KEYS.map((k) => [k, on(d[k]) ?? on(ch[k]) ?? on(ev[k]) ?? false])) as NotifPrefs;
}

// PUT /notifications/preferences merges a partial update: each toggle sends only its own key.
export async function setNotifPref(key: NotifKey, value: boolean): Promise<void> {
  await http("/notifications/preferences", { method: "PUT", body: { [key]: value } });
}
