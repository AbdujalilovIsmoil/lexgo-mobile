import type { QueryClient } from "@tanstack/react-query";
import type { Prefs } from "@/entities/notification/api/prefsApi";
import { notificationKeys } from "@/entities/notification/model/keys";
import type { Notification } from "@/entities/notification/model/types";
import { channelOf } from "@/shared/push/channels";
import { routeData } from "@/shared/push/schedule";
import { alertAllowed } from "./prefsGate";
import { onScreen } from "./onScreen";
import { markSeen, readWatermark, wasSeen } from "./seen";

jest.mock("expo-notifications", () => ({ SchedulableTriggerInputTypes: {}, AndroidImportance: {}, AndroidNotificationVisibility: {} }));
jest.mock("@/shared/analytics", () => ({ track: () => undefined }));

const n = (p: Partial<Notification>): Notification => ({ id: "1", ids: ["1"], title: "T", body: "B", category: "system", event: "", channels: [], data: {}, entityType: "", entityId: "", deepLink: "", read: false, createdAt: "2026-10-10T10:00:00Z", ...p });

describe("channelOf", () => {
  it("calls ring on the loud channel, chat on messages, the rest on default", () => {
    expect(channelOf("chat", "meeting_invite")).toBe("calls");
    expect(channelOf("chat", "call.incoming")).toBe("calls");
    expect(channelOf("chat", "call_extension_approved")).toBe("calls");
    expect(channelOf("chat", "secure_chat.message_created")).toBe("messages");
    expect(channelOf("payments", "payment_paid")).toBe("default");
  });
});

describe("routeData: only ids leave the phone", () => {
  it("keeps routing ids, drops names, phones and message text", () => {
    expect(routeData({ room_id: "r1", order_id: "o1", phone: "+998901234567", name: "Ali", message: "secret text", content: "x" })).toEqual({ room_id: "r1", order_id: "o1" });
  });
  it("drops empty and non-string values", () => {
    expect(routeData({ room_id: "", call_id: 5, deep_link: "lexgo://x" })).toEqual({ deep_link: "lexgo://x" });
  });
});

describe("onScreen", () => {
  it("the notification list and the open chat room do not need a banner", () => {
    expect(onScreen(n({}), "/notifications")).toBe(true);
    expect(onScreen(n({}), "/notifs")).toBe(true);
    expect(onScreen(n({ data: { room_id: "abc-123" } }), "/chat/abc-123")).toBe(true);
    expect(onScreen(n({ data: { room_id: "abc-123" } }), "/chat/other")).toBe(false);
    expect(onScreen(n({ data: { room_id: "abc-123" } }), "/messages")).toBe(false);
    expect(onScreen(n({ data: {} }), "/chat/abc-123")).toBe(false);
  });
});

describe("seen", () => {
  it("an event is announced once, and the watermark only moves forward", async () => {
    expect(wasSeen("k1")).toBe(false);
    markSeen("k1", "2026-10-10T10:00:00Z");
    expect(wasSeen("k1")).toBe(true);
    expect(wasSeen("k2")).toBe(false);
    await new Promise((r) => setTimeout(r, 5));
    expect(await readWatermark()).toBe("2026-10-10T10:00:00Z");
    markSeen("k3", "2026-10-09T00:00:00Z");
    await new Promise((r) => setTimeout(r, 5));
    expect(await readWatermark()).toBe("2026-10-10T10:00:00Z");
  });
});

describe("alertAllowed", () => {
  const qc = (prefs: Partial<Prefs> | undefined, fail = false) => ({ getQueryData: () => prefs, fetchQuery: async () => { if (fail) throw new Error("x"); return prefs; } }) as unknown as QueryClient;
  it("follows the push switch and the topic switch of the category", async () => {
    expect(await alertAllowed(qc({ push: false } as Prefs), n({ category: "chat" }))).toBe(false);
    expect(await alertAllowed(qc({ push: true, messages: false } as Prefs), n({ category: "chat" }))).toBe(false);
    expect(await alertAllowed(qc({ push: true, messages: true } as Prefs), n({ category: "chat" }))).toBe(true);
    expect(await alertAllowed(qc({ push: true, orders: false } as Prefs), n({ category: "payments" }))).toBe(true);
    expect(await alertAllowed(qc({ push: true, marketing: false } as Prefs), n({ category: "marketing" }))).toBe(false);
  });
  it("system alerts have no topic switch; unknown prefs mean 'alert', never a missed call", async () => {
    expect(await alertAllowed(qc({ push: true } as Prefs), n({ category: "system" }))).toBe(true);
    expect(await alertAllowed(qc(undefined, true), n({ category: "chat" }))).toBe(true);
  });
});

it("notificationKeys are stable (persisted cache depends on them)", () => {
  expect(notificationKeys.prefs).toEqual(["notification-prefs"]);
  expect(notificationKeys.list).toEqual(["notifications", "list"]);
});
