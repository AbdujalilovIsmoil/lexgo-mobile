import { canChatWith, chatRoomWith, orderGivesChat } from "./chatAccess";

// A running order whose chat the backend opened (can_start_chat + room), as /marketplace/me/orders sends it after payment.
const o = (p: Partial<Parameters<typeof orderGivesChat>[0]> = {}) => ({ status: "in_progress", paymentStatus: "paid", lawyerUserId: "L1", roomId: "r1", canStartChat: true, ...p });

describe("canChatWith", () => {
  it("is false with no orders or no specialist", () => {
    expect(canChatWith("L1", [])).toBe(false);
    expect(canChatWith("L1", undefined)).toBe(false);
    expect(canChatWith("", [o()])).toBe(false);
  });
  it("is true for an order in work whose chat is open", () => {
    expect(canChatWith("L1", [o()])).toBe(true);
    expect(canChatWith("L1", [o({ status: "result_ready" })])).toBe(true);
    expect(canChatWith("L1", [o({ status: "paid", paymentStatus: "" })])).toBe(true);
  });
  it("ignores other specialists' orders", () => expect(canChatWith("L2", [o()])).toBe(false));
  it("is false once the service is used up or stopped: completed, rated, done, closed, cancelled, declined, refunded", () => {
    for (const status of ["completed", "rated", "done", "closed", "cancelled", "declined", "rejected", "lost", "refunded"]) expect(canChatWith("L1", [o({ status })])).toBe(false);
    expect(canChatWith("L1", [o({ paymentStatus: "refunded" })])).toBe(false);
  });
  it("is false while the payment is not approved", () => {
    expect(canChatWith("L1", [o({ status: "pending_payment", paymentStatus: "pending" })])).toBe(false);
    expect(canChatWith("L1", [o({ status: "waiting_payment", paymentStatus: "" })])).toBe(false);
    expect(canChatWith("L1", [o({ status: "pending", paymentStatus: "pending" })])).toBe(false);
  });
  it("is false while the backend has not opened the chat (no can_start_chat / no room), like the web's 'paid' step", () => {
    expect(canChatWith("L1", [o({ canStartChat: false })])).toBe(false);
    expect(canChatWith("L1", [o({ canStartChat: false, roomId: "" })])).toBe(false);
  });
  it("one live order is enough even when older ones are finished", () => expect(canChatWith("L1", [o({ status: "completed" }), o()])).toBe(true));
});

describe("chatRoomWith", () => {
  it("gives the room of the running order, not of finished ones", () => {
    expect(chatRoomWith("L1", [o({ status: "completed", roomId: "old" }), o({ roomId: "live" })])).toBe("live");
  });
  it("is empty without such an order", () => {
    expect(chatRoomWith("L1", [o({ status: "completed" })])).toBe("");
    expect(chatRoomWith("L1", undefined)).toBe("");
  });
});
