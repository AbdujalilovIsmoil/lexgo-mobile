import { asDict, asStr } from "@/shared/lib/json";
import type { Delivery, DeliveryTone } from "../model/types";

export function normChannel(v: unknown): string {
  const c = asStr(v).trim().toLowerCase();
  if (/^(in_app|inapp|in-app|app|web|site)$/.test(c)) return "in_app";
  if (/^(push|fcm|apns|firebase)$/.test(c)) return "push";
  if (/^(telegram|tg|telegram_bot)$/.test(c)) return "telegram";
  if (/^(email|mail|e-mail)$/.test(c)) return "email";
  return c;
}

export function deliveryTone(status: string): DeliveryTone {
  const s = status.trim().toLowerCase();
  if (/^(sent|delivered|success|succeeded|ok|done|completed|read|opened)$/.test(s)) return "delivered";
  if (/^(queued|pending|scheduled|processing|sending|retry|retrying|waiting|created|new|deferred|standby|not_configured|unconfigured|provider_not_configured)$/.test(s)) return "pending";
  if (/^(failed|error|bounced|rejected|undelivered|undeliverable|expired)$/.test(s)) return "failed";
  return "unknown";
}

const text = (...v: unknown[]): string => v.map((x) => (typeof x === "string" ? x.trim() : "")).find(Boolean) ?? "";

// Per-channel records from a list, a channel → status map, or a single record.
function fromSource(src: unknown): { channel: string; status: string }[] {
  const out: { channel: string; status: string }[] = [];
  const add = (channel: unknown, status: unknown) => {
    const c = normChannel(text(channel));
    const s = text(status).toLowerCase();
    if (c && s) out.push({ channel: c, status: s });
  };
  const record = (x: unknown) => {
    const r = asDict(x);
    add(text(r.channel, r.channel_type, r.name, r.type, r.provider), text(r.status, r.state, r.delivery_status));
  };
  if (Array.isArray(src)) src.forEach(record);
  else if (src && typeof src === "object") {
    const r = src as Record<string, unknown>;
    if ("channel" in r || "status" in r || "state" in r) record(r);
    else for (const [k, st] of Object.entries(r)) add(k, st && typeof st === "object" ? text(asDict(st).status, asDict(st).state) : st);
  }
  return out;
}

// Delivery records out of whatever shape the cascade answers with; falls back to the row's own channel + status.
export function normDeliveries(v: unknown, fallbackChannel = ""): Delivery[] {
  const d = asDict(v);
  const found = [d.deliveries, d.delivery, d.channels, d.cascade].map(fromSource).find((l) => l.length) ?? [];
  const own = normChannel(text(d.channel, fallbackChannel));
  const status = text(d.status, d.delivery_status).toLowerCase();
  if (!found.length && own && status) found.push({ channel: own, status });
  const byChannel = new Map<string, Delivery>();
  for (const x of found) byChannel.set(x.channel, { ...x, tone: deliveryTone(x.status) });
  return [...byChannel.values()];
}
