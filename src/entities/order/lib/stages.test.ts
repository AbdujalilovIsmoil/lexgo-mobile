import { canCancelOrder, canCompleteOrder, orderNumber } from "./actions";
import { mergeOrders, entryText } from "./merge";
import { serviceStageOf } from "./serviceStage";
import { isOrderPending, marketStageOf, STAGE_STEP } from "./stage";
import { isOpenOrder, isTakenOrder } from "./status";
import { buildTimeline } from "./timeline";
import type { MarketOrder } from "../model/marketTypes";
import type { Order } from "../model/types";

const m = (p: Partial<MarketOrder>) => ({ id: "1", workId: "ADV-1", status: "pending", paymentStatus: "", cancelOffered: false, completeOffered: false, requestedAt: "r", paidAt: "", updatedAt: "u", canStartChat: false, serviceTitle: "S", lawyerName: "L", createdAt: "2026-10-01", ...p }) as unknown as MarketOrder;
const o = (p: Partial<Order>) => ({ id: "2", workId: "ORD-2", status: "new", paymentStatus: "", createdAt: "2026-10-02", title: "T", serviceName: "SN", ...p }) as unknown as Order;

describe("marketStageOf", () => {
  it("cancelled, completed, pending, active", () => {
    expect(marketStageOf(m({ status: "refunded" }))).toBe("cancelled");
    expect(marketStageOf(m({ status: "rated" }))).toBe("completed");
    expect(marketStageOf(m({ status: "pending_payment" }))).toBe("pending");
    expect(marketStageOf(m({ status: "pending", paymentStatus: "paid" }))).toBe("active");
    expect(marketStageOf(m({ status: "in_progress" }))).toBe("active");
  });
  it("pending covers every waiting-for-payment status", () => {
    for (const s of ["pending_payment", "pending_confirmation", "waiting_payment"]) expect(isOrderPending({ status: s, paymentStatus: "paid" })).toBe(true);
    expect(isOrderPending({ status: "pending", paymentStatus: "" })).toBe(true);
    expect(isOrderPending({ status: "pending", paymentStatus: "paid" })).toBe(false);
  });
  it("step track: stopped is -1, done is past the last step", () => {
    expect(STAGE_STEP).toEqual({ pending: 1, active: 2, completed: 4, cancelled: -1 });
  });
});

describe("order actions", () => {
  it("cancel only while payment is pending, complete only while in work", () => {
    expect(canCancelOrder(m({ cancelOffered: true, status: "pending_payment" }))).toBe(true);
    expect(canCancelOrder(m({ cancelOffered: true, status: "in_progress" }))).toBe(false);
    expect(canCancelOrder(m({ cancelOffered: false, status: "pending_payment" }))).toBe(false);
    expect(canCompleteOrder(m({ completeOffered: true, status: "in_progress" }))).toBe(true);
    expect(canCompleteOrder(m({ completeOffered: true, status: "completed" }))).toBe(false);
  });
  it("shows the ADV number, never an empty string", () => {
    expect(orderNumber(m({ workId: "ADV-9" }))).toBe("ADV-9");
    expect(orderNumber(m({ workId: "" }))).toBe("—");
  });
});

describe("serviceStageOf", () => {
  it("maps service orders onto the same four stages", () => {
    expect(serviceStageOf({ status: "declined", paymentStatus: "paid" })).toBe("cancelled");
    expect(serviceStageOf({ status: "delivered", paymentStatus: "" })).toBe("completed");
    expect(serviceStageOf({ status: "started", paymentStatus: "" })).toBe("active");
    expect(serviceStageOf({ status: "new", paymentStatus: "paid" })).toBe("active");
    expect(serviceStageOf({ status: "new", paymentStatus: "" })).toBe("pending");
  });
});

describe("open / taken for sellers", () => {
  it("an unpaid marketplace order is not open to take", () => {
    expect(isOpenOrder(o({ status: "new" }))).toBe(true);
    expect(isOpenOrder(o({ status: "pending_payment", source: "marketplace" } as Partial<Order>))).toBe(false);
    expect(isOpenOrder(o({ status: "accepted" }))).toBe(false);
  });
  it("dropped orders are taken but not relevant", () => {
    expect(isTakenOrder(o({ status: "in_progress" }))).toBe(true);
    expect(isTakenOrder(o({ status: "declined" }))).toBe(false);
    expect(isTakenOrder(o({ status: "new" }))).toBe(false);
  });
});

describe("mergeOrders", () => {
  it("drops service copies of marketplace purchases and sorts newest first", () => {
    const rows = mergeOrders([m({ id: "a", createdAt: "2026-10-05" }), m({ id: "b", createdAt: "2026-10-01" })], [o({ id: "a" }), o({ id: "c", createdAt: "2026-10-09" }), o({ id: "d", source: "marketplace" } as Partial<Order>)]);
    expect(rows.map((r) => r.key)).toEqual(["s-c", "m-a", "m-b"]);
  });
  it("search text covers the number, title and lawyer", () => {
    const [e] = mergeOrders([m({ workId: "ADV-7", serviceTitle: "Nikoh", lawyerName: "Ali" })], []);
    expect(entryText(e)).toContain("ADV-7");
    expect(entryText(e).toLowerCase()).toContain("nikoh");
    expect(entryText(e)).toContain("Ali");
  });
});

describe("buildTimeline", () => {
  const w = { status: (s: string) => `st:${s}`, step: (k: string) => `step:${k}` };
  it("a pending purchase waits for payment", () => {
    expect(buildTimeline(m({ status: "pending_payment" }), [], w).map((i) => i.key)).toEqual(["request", "wait"]);
  });
  it("an active one is paid and working, a completed one is done", () => {
    expect(buildTimeline(m({ status: "in_progress" }), [], w).map((i) => [i.key, i.state])).toEqual([["request", "done"], ["paid", "done"], ["work", "now"]]);
    expect(buildTimeline(m({ status: "completed" }), [], w).at(-1)).toMatchObject({ key: "done", state: "done" });
  });
  it("a cancelled paid order shows the payment then the failure", () => {
    expect(buildTimeline(m({ status: "cancelled", paymentStatus: "paid" }), [], w).map((i) => i.key)).toEqual(["request", "paid", "cancelled"]);
    expect(buildTimeline(m({ status: "cancelled" }), [], w).map((i) => i.key)).toEqual(["request", "cancelled"]);
  });
  it("backend history wins, oldest first, only the last active row is 'now'", () => {
    const hist = [{ at: "3", status: "in_progress", note: "" }, { at: "1", status: "paid", note: "ok" }] as never;
    const t = buildTimeline(m({ status: "in_progress" }), hist, w);
    expect(t.map((i) => i.at)).toEqual(["1", "3"]);
    expect(t.map((i) => i.state)).toEqual(["done", "now"]);
    expect(t[0].note).toBe("ok");
  });
});
