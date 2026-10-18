import { addPayOf, expiryOf } from "./addPay";
import { resolveBody } from "./resolveBody";
import { settleRefunds, startRefund } from "./refundWait";
import { marketBody } from "../api/marketBody";

const H = 3_600_000;
const base = { lawyerUserId: "u1", note: " hi ", channel: "chat", time: "" };

describe("marketBody", () => {
  it("sends a service with its options and trimmed note", () => {
    expect(marketBody({ ...base, serviceId: "s1", ids: ["a"] })).toEqual({ lawyer_user_id: "u1", service_id: "s1", selected_option_ids: ["a"], note: "hi", preferred_channel: "chat" });
  });
  it("sends a package with an empty selection", () => {
    const b = marketBody({ ...base, packageId: "p1" });
    expect(b.package_id).toBe("p1");
    expect(b.service_id).toBeUndefined();
    expect(b.selected_option_ids).toEqual([]);
  });
  it("rejects both or neither of service_id / package_id", () => {
    expect(() => marketBody({ ...base, serviceId: "s", packageId: "p" })).toThrow();
    expect(() => marketBody({ ...base })).toThrow();
  });
});

describe("resolveBody", () => {
  it("builds the three actions", () => {
    expect(resolveBody({ action: "replace_options", ids: ["x"] })).toEqual({ action: "replace_options", selected_option_ids: ["x"] });
    expect(resolveBody({ action: "full_refund", reason: " r " })).toEqual({ action: "full_refund", reason: "r" });
    expect(resolveBody({ action: "partial_refund", amount: 100000, reason: "r" })).toEqual({ action: "partial_refund", amount: 100000, reason: "r" });
  });
});

describe("addPayOf", () => {
  it("is null without a request id", () => expect(addPayOf({ details: {} })).toBeNull());
  it("reads the id, pending flag and the additional payment", () => {
    const a = addPayOf({ status: "waiting_payment", details: { additional_payment_request_id: "r1" }, payment: { target_type: "marketplace_additional_payment", status: "pending", amount: 35000, provider_payload: { selected_option_ids: ["o1"] } } });
    expect(a).toMatchObject({ requestId: "r1", pending: true, amount: 35000, selectedIds: ["o1"] });
  });
});

describe("expiryOf", () => {
  const created = "2026-10-14T00:00:00Z";
  const at = (h: number) => Date.parse(created) + h * H;
  it("is ok before 21 h, warns from 21 h, expires at 24 h", () => {
    expect(expiryOf({ expiresAt: "", createdAt: created }, at(20)).state).toBe("ok");
    expect(expiryOf({ expiresAt: "", createdAt: created }, at(21.5)).state).toBe("warn");
    expect(expiryOf({ expiresAt: "", createdAt: created }, at(24)).state).toBe("expired");
  });
  it("prefers the backend expires_at and has no state without dates", () => {
    expect(expiryOf({ expiresAt: "2026-10-14T05:00:00Z", createdAt: created }, at(4)).state).toBe("warn");
    expect(expiryOf({ expiresAt: "", createdAt: "" }).state).toBe("none");
  });
});

describe("refund wait", () => {
  it("settles by request or order id, or all waiting when the event has no id", () => {
    const m = startRefund(startRefund({}, "r1", "o1"), "r2", "o2");
    expect(settleRefunds(m, "approved", ["o2"]).r2.phase).toBe("approved");
    expect(settleRefunds(m, "approved", ["o2"]).r1.phase).toBe("waiting");
    expect(settleRefunds(m, "rejected", []).r1.phase).toBe("rejected");
  });
});
