import { asNum, asStr } from "@/shared/lib/json";
import { fmtMoney } from "@/shared/lib/money";
import { readableBody, statusText } from "./readable";
import type { Notification } from "./types";

type T = (key: string, params?: Record<string, string | number>) => string;
const IDS: Record<string, string> = {};
const NAMESPACES = ["nt5", "nt6"];

// "support.ticket_created" → "support_ticket_created": the key under which a template is stored.
const idOf = (event: string): string => (IDS[event] ??= event.replace(/[^a-z0-9_]/gi, "_"));

function template(t: T, event: string, part: "t" | "b" | "x", vars: Record<string, string>): string | null {
  const id = idOf(event);
  for (const ns of NAMESPACES) {
    const key = `${ns}.${id}.${part}`;
    const v = t(key, vars);
    if (v !== key) return v;
  }
  return null;
}

// A template whose variable was empty leaves holes ("()", "«»", double spaces): close them up.
const tidy = (s: string): string => s.replace(/\(\s*\)|«\s*»/g, "").replace(/[ \t]{2,}/g, " ").replace(/\s+([.,:;!?])/g, "$1").trim();

function varsOf(n: Notification, t: T, workId: string): Record<string, string> {
  const d = n.data;
  const status = asStr(d.status);
  const sum = asNum(d.amount, 0) || asNum(d.price, 0);
  return {
    work: workId || asStr(d.work_id ?? d.order_work_id),
    status: status ? statusText(status, t) : "",
    payStatus: asStr(d.payment_status) ? statusText(asStr(d.payment_status), t) : "",
    pages: asStr(d.page_count),
    amount: sum ? `${fmtMoney(sum)} ${t("common.currency")}` : "",
    name: asStr(d.lawyer_name ?? d.caller_name ?? d.client_name),
    service: asStr(d.service_title ?? d.template_title ?? d.title),
    minutes: asStr(d.minutes),
    body: n.body,
  };
}

// What a notification says in the user's language: the event's template when one exists
// (nt5-nt6, like portal.notifications.events.* on the web), the backend text otherwise.
export function eventText(n: Notification, t: T, workId = ""): { title: string; body: string } {
  const vars = varsOf(n, t, workId);
  const blocked = n.data.is_blocked === true;
  const title = n.event ? template(t, n.event, "t", vars) : null;
  const body = n.event ? template(t, n.event, blocked ? "x" : "b", vars) : null;
  return { title: title ? tidy(title) : n.title, body: body ? tidy(body) : readableBody(n, t, workId) };
}

// Text for the lock screen: chat messages never leak their content outside the app (the in-app banner may show it).
export function alertText(n: Notification, t: T, inApp = false): { title: string; body: string } {
  const text = eventText(n, t);
  if (inApp) return text;
  return n.event.startsWith("secure_chat") || n.channels.includes("secure_chat") ? { title: text.title, body: t("nt1.hiddenBody") } : text;
}
