import { groupOf, isPendingStatus, phaseOf } from "./status";

describe("phaseOf", () => {
  it("pending: Telegram payments wait for a person, the rest for the provider", () => {
    expect(phaseOf({ status: "pending", method: "telegram_manual" })).toBe("pending_confirmation");
    for (const s of ["pending", "payment_pending", "created", "processing", "unpaid", "waiting_payment"]) expect(phaseOf({ status: s, method: "atmos" })).toBe("awaiting");
  });
  it("paid, refunded, cancelled and everything else failed", () => {
    for (const s of ["paid", "held", "succeeded", "success"]) expect(phaseOf({ status: s, method: "" })).toBe("paid");
    for (const s of ["refunded", "partially_refunded"]) expect(phaseOf({ status: s, method: "" })).toBe("refunded");
    for (const s of ["cancelled", "canceled", "rejected"]) expect(phaseOf({ status: s, method: "" })).toBe("cancelled");
    for (const s of ["failed", "expired", "weird", ""]) expect(phaseOf({ status: s, method: "" })).toBe("failed");
  });
  it("ignores case and padding", () => {
    expect(phaseOf({ status: "  PAID ", method: "" })).toBe("paid");
    expect(isPendingStatus(" Pending ")).toBe(true);
  });
});

describe("groupOf", () => {
  it("buckets statuses for the filters", () => {
    expect(groupOf("processing")).toBe("pending");
    expect(groupOf("held")).toBe("paid");
    expect(groupOf("partially_refunded")).toBe("refunded");
    expect(groupOf("cancelled")).toBe("failed");
    expect(groupOf("anything")).toBe("failed");
  });
});
