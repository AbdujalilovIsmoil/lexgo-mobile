import { phaseOfStatus } from "./phase";

// The order barrel pulls in UI (reanimated); the receipt's status rule needs none of it.
jest.mock("@/entities/order", () => ({ orderPhase: jest.fn() }));

describe("purchase receipt phase (Enterprise contract §4)", () => {
  it("never reads 'paid' from the order's creation — only from the payment's own status", () => {
    expect(phaseOfStatus("pending_payment", "pending")).toBe("pending");
    expect(phaseOfStatus("payment_pending")).toBe("pending");
    expect(phaseOfStatus("paid")).toBe("pending");
    expect(phaseOfStatus("sent_to_seller", "paid")).toBe("paid");
    expect(phaseOfStatus("cancelled", "paid")).toBe("cancelled");
    expect(phaseOfStatus("completed")).toBe("completed");
  });
});
