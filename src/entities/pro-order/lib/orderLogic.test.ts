import { fileIdFromPath } from "./complete";
import { hms, msUntil, ratingMsLeft } from "./countdown";
import { isPaused } from "./additional";
import { stageOf } from "./stage";
import type { OrderRating } from "../model/extraTypes";

const rating = (p: Partial<OrderRating>): OrderRating => ({ available: true, closed: false, reason: "", deadlineAt: "", remainingSeconds: 0, stars: 0, comment: "", fetchedAt: 0, ...p });
describe("fileIdFromPath", () => {
  it("reads the file id from a secure path", () => {
    const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
    expect(fileIdFromPath(`/secure-files/${id}`)).toBe(id);
    expect(fileIdFromPath(`/secure-chats/r/messages/${id}/file?x=1`)).toBe(id);
    expect(fileIdFromPath("/nothing")).toBe("");
  });
});

describe("countdowns", () => {
  it("formats hours:minutes:seconds", () => {
    expect(hms(24 * 3600 * 1000)).toBe("24:00:00");
    expect(hms(3_661_000)).toBe("01:01:01");
    expect(hms(-5)).toBe("00:00:00");
  });
  it("msUntil follows the backend deadline", () => {
    expect(msUntil("2026-10-14T12:15:00Z", Date.parse("2026-10-14T12:00:00Z"))).toBe(900_000);
    expect(msUntil("2026-10-14T12:15:00Z", Date.parse("2026-10-14T13:00:00Z"))).toBe(0);
    expect(msUntil("", 1)).toBe(0);
  });
  it("rating window: deadline first, remaining seconds as fallback, closed = 0", () => {
    const now = Date.parse("2026-10-14T12:00:00Z");
    expect(ratingMsLeft(rating({ deadlineAt: "2026-10-14T12:10:00Z", remainingSeconds: 900 }), now)).toBe(600_000);
    expect(ratingMsLeft(rating({ remainingSeconds: 900, fetchedAt: now - 60_000 }), now)).toBe(840_000);
    expect(ratingMsLeft(rating({ available: false, deadlineAt: "2026-10-14T12:10:00Z" }), now)).toBe(0);
    expect(ratingMsLeft(rating({ deadlineAt: "2026-10-14T11:00:00Z", remainingSeconds: 900 }), now)).toBe(0);
  });
});

describe("supplemental payment pause (TZ 11)", () => {
  const add = { id: "a", status: "pending", total: 0, note: "", optionIds: [], requestedAt: "", expiresAt: "" };
  it("a waiting_payment or open request pauses the work and keeps the order in the seller's queue", () => {
    expect(isPaused({ status: "waiting_payment" })).toBe(true);
    expect(isPaused({ status: "in_progress", additional: add })).toBe(true);
    expect(isPaused({ status: "in_progress", additional: { ...add, status: "approved" } })).toBe(false);
    expect(stageOf({ status: "waiting_payment", paymentStatus: "pending", additional: add })).toBe("active");
    expect(stageOf({ status: "pending_payment", paymentStatus: "pending", additional: null })).toBe("unpaid");
  });
});

describe("seller actions of the marketplace flow (TZ.md §5, §6, §9)", () => {
  const { actionsOf } = jest.requireActual("./moves") as typeof import("./moves");
  const { normFlow } = jest.requireActual("@/entities/market-flow") as typeof import("@/entities/market-flow");
  const order = (raw: Record<string, unknown>) =>
    ({ id: "o1", workId: "ADV-1", status: String(raw.status), paymentStatus: String(raw.payment_status ?? "paid"), serviceId: "s1", packageId: "", canComplete: !!raw.complete_url, canChat: false, canCall: false, roomId: "", additional: null, flow: normFlow(raw) }) as unknown as import("../model/types").ProOrder;
  it("an assignment is answered on its own card, not from the bar", () => {
    const a = actionsOf(order({ status: "sent_to_seller", payment_status: "pending", acceptance_deadline_at: "2026-10-24T10:30:00Z" }));
    expect(a.accept).toBe(false);
    expect(a.decline).toBe(false);
  });
  it("nothing to start before the advance unlocked contact", () => {
    const a = actionsOf(order({ status: "accepted", payment_status: "pending", contact_unlocked: false, can_start: true, start_url: "/marketplace/orders/o1/start" }));
    expect(a.start).toBe(false);
    expect(a.moves).toEqual([]);
  });
  it("start_url replaces the plain start moves", () => {
    const a = actionsOf(order({ status: "paid", payment_status: "paid", contact_unlocked: true, can_start: true, start_url: "/marketplace/orders/o1/start" }));
    expect(a.start).toBe(true);
    expect(a.moves).toEqual([]);
  });
  it("can_complete=false wins over a complete_url", () => {
    expect(actionsOf(order({ status: "in_progress", can_complete: false, complete_url: "/x" })).complete).toBe(false);
    expect(actionsOf(order({ status: "in_progress", can_complete: true, complete_url: "/x" })).complete).toBe(true);
    expect(actionsOf(order({ status: "in_progress", complete_url: "/x" })).complete).toBe(true);
  });
});
