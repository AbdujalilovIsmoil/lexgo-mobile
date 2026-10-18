import { normNotification } from "../../api/normalize";
import { categoryOf } from "../classify";
import { foldNotifications } from "../fold";

const row = (id: string, kind: string, read: boolean, data: Record<string, unknown>, at = "2026-10-10T10:00:00.000Z") => ({ id, title: "T", body: "B", kind, read, data, meta: data, category: "system", created_at: at });
const ev = { event: "order_created", order_id: "o1" };

const CATS: [string, string, string][] = [
  ["order_created", "", "orders"], ["marketplace_purchase_approved", "", "orders"], ["payment_paid", "", "payments"],
  ["call_extension_payment_requested", "", "payments"], ["secure_chat_message", "", "chat"], ["support.ticket_message", "", "chat"],
  ["urgent_advokat.cancelled", "", "chat"], ["document_lawyer_request_sent", "", "documents"], ["quality_complaint.created", "", "documents"],
  ["subscription_activated", "", "payments"], ["studio.object_reviewed", "", "system"], ["upsell_redeemed", "", "marketing"],
  ["", "Yangi buyurtma keldi", "orders"], ["", "Hujjat tayyor", "documents"], ["", "salom", "system"],
];

// Run: node scripts/check-infra.mjs
export function runNotifChecks(): { total: number; failures: string[] } {
  const f: string[] = [];
  const eq = (name: string, got: unknown, want: unknown) => JSON.stringify(got) === JSON.stringify(want) || f.push(`${name}: ${JSON.stringify(got)} != ${JSON.stringify(want)}`);
  for (const [event, title, want] of CATS) eq(`category ${event || title}`, categoryOf(event, [], title), want);
  const a = normNotification(row("1", "in_app", false, ev));
  eq("staging row", [a.event, a.channels, a.category, a.read], ["order_created", ["in_app"], "orders", false]);
  const b = normNotification({ id: "2", title: "x", body: "y", type: "payment_paid", entity_type: "payment", entity_id: "p1", deep_link: "lexgo://payments/p1", read_at: "2026-10-10T10:00:00Z", created_at: "2026-10-10T10:00:00Z" });
  eq("TZ row", [b.event, b.entityType, b.entityId, b.deepLink, b.read], ["payment_paid", "payment", "p1", "lexgo://payments/p1", true]);
  eq("admin category on the row", normNotification({ ...row("3", "push", false, {}), category: "marketing", title: "Aksiya" }).category, "marketing");
  const copies = ["in_app", "push", "telegram"].map((k, i) => normNotification(row(`c${i}`, k, i === 2, ev)));
  const one = foldNotifications(copies);
  eq("fold: one event", [one.length, one[0].ids, one[0].channels, one[0].read, one[0].id], [1, ["c0", "c1", "c2"], ["in_app", "push", "telegram"], false, "c0"]);
  eq("fold: other payload stays apart", foldNotifications([...copies, normNotification(row("d", "in_app", false, { ...ev, order_id: "o2" }))]).length, 2);
  eq("fold: same channel twice stays apart", foldNotifications([normNotification(row("e", "in_app", false, ev)), normNotification(row("f", "in_app", false, ev, "2026-10-10T10:00:20.000Z"))]).length, 2);
  eq("fold: far apart in time", foldNotifications([normNotification(row("g", "in_app", false, ev)), normNotification(row("h", "push", false, ev, "2026-10-10T10:09:00.000Z"))]).length, 2);
  eq("fold: all read = read", foldNotifications(copies.map((c) => ({ ...c, read: true })))[0].read, true);
  return { total: CATS.length + 8, failures: f };
}
