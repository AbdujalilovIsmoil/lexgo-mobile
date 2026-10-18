import { translate } from "@/shared/i18n";
import { categoryOf } from "./classify";
import { foldKey, foldNotifications } from "./fold";
import { readableBody, statusText } from "./readable";
import { linkInputOf } from "./linkInput";
import { normNotification } from "../api/normalize";
import type { Notification } from "./types";

const t = (k: string, p?: Record<string, string | number>) => translate("uz", k, p);
const row = (p: Partial<Notification>): Notification => ({ id: "1", ids: ["1"], title: "T", body: "B", category: "system", event: "", channels: [], data: {}, entityType: "", entityId: "", deepLink: "", read: false, createdAt: "2026-10-10T10:00:00Z", ...p });

describe("categoryOf", () => {
  it("exact names beat prefix rules", () => {
    expect(categoryOf("payment_paid", [], "")).toBe("payments");
    expect(categoryOf("secure_chat_message", [], "")).toBe("chat");
    expect(categoryOf("meeting_invite", [], "")).toBe("chat");
    expect(categoryOf("contract_signature_otp", [], "")).toBe("documents");
  });
  it("prefix rules", () => {
    expect(categoryOf("order_status_changed", [], "")).toBe("orders");
    expect(categoryOf("secure_chat.message_created", [], "")).toBe("chat");
    expect(categoryOf("refund_created", [], "")).toBe("payments");
    expect(categoryOf("ai_document_ready", [], "")).toBe("documents");
    expect(categoryOf("referral_joined", [], "")).toBe("marketing");
    expect(categoryOf("security_alert", [], "")).toBe("system");
  });
  it("a calendar event is a call only when its type says so", () => {
    expect(categoryOf("calendar_event_created", [], "", { type: "video meeting" })).toBe("chat");
    expect(categoryOf("calendar_event_created", [], "", { type: "task" })).toBe("system");
  });
  it("falls back to channel, then title, then system", () => {
    expect(categoryOf("", ["secure_chat"], "")).toBe("chat");
    expect(categoryOf("", [], "Yangi xabar")).toBe("chat");
    expect(categoryOf("", [], "To'lov qabul qilindi")).toBe("payments");
    expect(categoryOf("", [], "???")).toBe("system");
  });
  it("an explicit category is honoured only without an event", () => {
    expect(categoryOf("", [], "", { category: "Marketing" })).toBe("marketing");
    expect(categoryOf("order_x", [], "", { category: "marketing" })).toBe("orders");
  });
});

describe("normNotification", () => {
  it("staging shape: kind is the channel, event in data", () => {
    const n = normNotification({ id: "9", kind: "in_app", title: "Yangi xabar", body: "x", data: { event: "secure_chat.message_created", room_id: "r" }, is_read: false, created_at: "2026-10-10T10:00:00Z" });
    expect(n).toMatchObject({ id: "9", ids: ["9"], channels: ["in_app"], event: "secure_chat.message_created", category: "chat", read: false });
  });
  it("TZ 28 shape: type is the event, read_at means read", () => {
    const n = normNotification({ id: "1", type: "order_status_changed", entity_type: "order", entity_id: "o1", deep_link: "lexgo://orders", metadata: { status: "paid" }, read_at: "2026-10-10T10:00:00Z" });
    expect(n).toMatchObject({ event: "order_status_changed", entityType: "order", entityId: "o1", deepLink: "lexgo://orders", read: true, category: "orders" });
  });
  it("a row's own category counts unless it is the default 'system'", () => {
    expect(normNotification({ id: "1", title: "x", category: "marketing" }).category).toBe("marketing");
    expect(normNotification({ id: "1", title: "To'lov", category: "system" }).category).toBe("payments");
  });
  it("survives junk", () => {
    expect(normNotification(null)).toMatchObject({ id: "", ids: [], title: "", read: false, category: "system" });
  });
});

describe("foldNotifications", () => {
  const ev = { event: "order_status_changed", data: { order_id: "o1" } };
  it("folds the per-channel rows of one event into one", () => {
    const rows = [row({ ...ev, id: "a", ids: ["a"], channels: ["push"], read: true }), row({ ...ev, id: "b", ids: ["b"], channels: ["in_app"], read: false }), row({ ...ev, id: "c", ids: ["c"], channels: ["telegram"], read: true })];
    const [one, ...rest] = foldNotifications(rows);
    expect(rest).toEqual([]);
    expect(one.id).toBe("b"); // the in_app row represents the group
    expect(one.ids.sort()).toEqual(["a", "b", "c"]);
    expect(one.channels.sort()).toEqual(["in_app", "push", "telegram"]);
    expect(one.read).toBe(false); // unread while any row is unread
  });
  it("keeps two events apart, and the same event after a minute, and two rows of one channel", () => {
    expect(foldNotifications([row({ ...ev, channels: ["push"] }), row({ event: "order_status_changed", data: { order_id: "o2" }, channels: ["in_app"] })]).length).toBe(2);
    expect(foldNotifications([row({ ...ev, channels: ["push"] }), row({ ...ev, channels: ["in_app"], createdAt: "2026-10-10T10:05:00Z" })]).length).toBe(2);
    expect(foldNotifications([row({ ...ev, channels: ["push"] }), row({ ...ev, channels: ["push"] })]).length).toBe(2);
  });
  it("foldKey ignores data.event and key order", () => {
    expect(foldKey(row({ event: "e", data: { b: 1, a: 2, event: "x" } }))).toBe(foldKey(row({ event: "e", data: { a: 2, b: 1 } })));
    expect(foldKey(row({ event: "", title: "T", body: "B" }))).toBe("t:T|B");
  });
});

describe("readableBody / statusText", () => {
  const uuid = "3e3a1b2c-1111-4222-8333-444455556666";
  it("swaps the uuid for the public number", () => {
    expect(readableBody(row({ body: `Buyurtma: ${uuid} Holat: new`, data: { status: "new" } }), t, "ADV-5")).toContain("ADV-5");
    expect(readableBody(row({ body: `Buyurtma: ${uuid} tayyor` }), t, "")).toBe("tayyor");
  });
  it("translates the status word and tolerates regex characters in it", () => {
    expect(() => readableBody(row({ body: "Holat: a+b", data: { status: "a+b" } }), t, "")).not.toThrow();
    expect(statusText("totally_unknown_state", t)).toBe("Totally unknown state");
  });
});

describe("linkInputOf", () => {
  it("passes the TZ 28 fields to the resolver", () => {
    expect(linkInputOf(row({ event: "e", category: "orders", entityType: "order", entityId: "o", deepLink: "lexgo://x", data: { a: 1 } }))).toEqual({ event: "e", category: "orders", entityType: "order", entityId: "o", deepLink: "lexgo://x", data: { a: 1 } });
  });
});
