import { http } from "@/shared/api";
import { listPayments, normIntent, normPayment, receiptPath } from "./paymentApi";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;

describe("normPayment", () => {
  it("reads PaymentHistoryOut and survives an empty object", () => {
    expect(normPayment({ id: "p1", amount: "99000", status: "paid", provider: "atmos", target_type: "subscription_plan", created_at: "2026-10-15T20:15:00Z", receipt_url: "/r" })).toMatchObject({ id: "p1", amount: 99000, method: "atmos", kind: "subscription_plan", hasReceipt: true, currency: "UZS" });
    expect(normPayment(null)).toMatchObject({ id: "", amount: 0, hasReceipt: false });
  });
});

describe("normIntent", () => {
  it("unwraps a nested payment and keeps only https payment urls", () => {
    expect(normIntent({ payment: { id: "p", amount: 5, payment_url: "https://pay.example/x" } })).toMatchObject({ id: "p", amount: 5, paymentUrl: "https://pay.example/x" });
    expect(normIntent({ id: "p", payment_url: "javascript:alert(1)" }).paymentUrl).toBe("");
    expect(normIntent({ id: "p", invoice: { payment_url: "http://insecure" } }).paymentUrl).toBe("");
    expect(normIntent({ id: "p", invoice: { payment_url: "https://ok.uz/i" } }).paymentUrl).toBe("https://ok.uz/i");
  });
});

describe("listPayments", () => {
  it("calls GET /payments, drops rows without id and sorts newest first", async () => {
    mockHttp.mockResolvedValueOnce({ items: [{ id: "a", created_at: "2026-10-01T00:00:00Z" }, { amount: 1 }, { id: "b", created_at: "2026-10-09T00:00:00Z" }] });
    const rows = await listPayments();
    expect(mockHttp).toHaveBeenCalledWith("/payments");
    expect(rows.map((r) => r.id)).toEqual(["b", "a"]);
  });
  it("accepts a bare array and an empty answer", async () => {
    mockHttp.mockResolvedValueOnce([{ id: "x" }]);
    expect((await listPayments()).length).toBe(1);
    mockHttp.mockResolvedValueOnce(null);
    expect(await listPayments()).toEqual([]);
  });
});

describe("receiptPath", () => {
  it("encodes the id", () => expect(receiptPath("a/b")).toBe("/payments/a%2Fb/receipt"));
});
