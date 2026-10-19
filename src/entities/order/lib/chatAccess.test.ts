import { canChatWith, orderGivesChat } from "./chatAccess";

const o = (p: Partial<Parameters<typeof orderGivesChat>[0]> = {}) => ({ status: "in_progress", paymentStatus: "paid", lawyerUserId: "L1", roomId: "", canStartChat: false, ...p });

describe("canChatWith", () => {
  it("is false with no orders or no specialist", () => {
    expect(canChatWith("L1", [])).toBe(false);
    expect(canChatWith("L1", undefined)).toBe(false);
    expect(canChatWith("", [o()])).toBe(false);
  });
  it("is true for a paid order in work with that specialist", () => {
    expect(canChatWith("L1", [o()])).toBe(true);
    expect(canChatWith("L1", [o({ status: "result_ready" })])).toBe(true);
  });
  it("ignores other specialists' orders", () => expect(canChatWith("L2", [o()])).toBe(false));
  it("is false once the order is completed, closed, cancelled, refunded or unpaid", () => {
    for (const status of ["completed", "closed", "rated", "cancelled", "declined", "refunded"]) expect(canChatWith("L1", [o({ status })])).toBe(false);
    expect(canChatWith("L1", [o({ paymentStatus: "refunded" })])).toBe(false);
    expect(canChatWith("L1", [o({ status: "pending_payment", paymentStatus: "pending" })])).toBe(false);
    expect(canChatWith("L1", [o({ status: "accepted", paymentStatus: "pending" })])).toBe(false);
  });
  it("one live order is enough even when older ones are finished", () => expect(canChatWith("L1", [o({ status: "completed" }), o()])).toBe(true));
  it("a room/can_start_chat flag counts when the payment field is empty", () => {
    expect(canChatWith("L1", [o({ paymentStatus: "", roomId: "r1" })])).toBe(true);
    expect(canChatWith("L1", [o({ paymentStatus: "", canStartChat: true })])).toBe(true);
  });
});
