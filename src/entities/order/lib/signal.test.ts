import { marketSignalOf, topicOf } from "./signal";

describe("marketSignalOf", () => {
  it("reads the first payment approval as paid", () => {
    const s = marketSignalOf({ event: "marketplace.order_paid", order_id: "o1", work_id: "ADV-1", room_id: "r1" });
    expect(s).toEqual({ kind: "paid", topic: "", orderId: "o1", workId: "ADV-1", roomId: "r1" });
  });
  it("a supplemental approval or a refund is not the first payment", () => {
    expect(marketSignalOf({ event: "marketplace.additional_payment_approved", order_id: "o1" })?.kind).toBe("other");
    expect(marketSignalOf({ event: "marketplace.refund_rejected", order_id: "o1" })?.topic).toBe("refund_rejected");
  });
  it("names every supplemental topic", () => {
    for (const k of ["requested", "approved", "rejected", "escalated"]) expect(topicOf(`marketplace.additional_payment_${k}`)).toBe(`additional_${k}`);
    expect(topicOf("marketplace.refund_approved")).toBe("refund_approved");
    expect(topicOf("marketplace.order_paid")).toBe("");
  });
  it("ignores other events", () => expect(marketSignalOf({ event: "chat.message" })).toBeNull());
});
