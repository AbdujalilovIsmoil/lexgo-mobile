import { useOriginStore } from "./originStore";
import { isPaidStatus, shouldSendPurchased } from "./usePurchased";

jest.mock("../lib/session", () => ({ promotionSessionId: () => "sess" }));

const origin = { orderId: "o1", eventUrl: "/e", placement: "completed" as const, session: "s1", at: 1, purchased: false };

describe("purchased", () => {
  it("is sent only for a request born from the promotion, shown as paid by the backend, and only once", () => {
    expect(shouldSendPurchased({ id: "r", payment: { status: "paid" } }, origin)).toBe(true);
    expect(shouldSendPurchased({ id: "r", payment: { status: "Approved" } }, origin)).toBe(true);
    expect(shouldSendPurchased({ id: "r", payment: { status: "pending" } }, origin)).toBe(false);
    expect(shouldSendPurchased({ id: "r", payment: null }, origin)).toBe(false);
    expect(shouldSendPurchased({ id: "r", payment: { status: "paid" } }, undefined)).toBe(false);
    expect(shouldSendPurchased({ id: "r", payment: { status: "paid" } }, { ...origin, purchased: true })).toBe(false);
    expect(isPaidStatus("awaiting_payment")).toBe(false);
  });
});

describe("origin store", () => {
  beforeEach(() => useOriginStore.getState().wipe());
  it("remembers the session that started a request and marks it purchased", () => {
    useOriginStore.getState().put("r1", { orderId: "o1", eventUrl: "/e", placement: "in_progress", session: "s1" });
    expect(useOriginStore.getState().items.r1).toMatchObject({ orderId: "o1", session: "s1", purchased: false });
    useOriginStore.getState().markPurchased("r1", true);
    expect(useOriginStore.getState().items.r1.purchased).toBe(true);
    useOriginStore.getState().markPurchased("missing", true);
    expect(useOriginStore.getState().items.missing).toBeUndefined();
  });
  it("keeps only the newest 40", () => {
    for (let i = 0; i < 45; i++) useOriginStore.getState().put(`r${i}`, { orderId: "o", eventUrl: "/e", placement: "completed", session: "s" });
    expect(Object.keys(useOriginStore.getState().items)).toHaveLength(40);
  });
});
