import { http } from "@/shared/api";
import { createRefundRequest } from "./refundApi";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;

it("POSTs a refund record with a rounded price and returns its work id", async () => {
  mockHttp.mockResolvedValueOnce({ work_id: "REF-1" });
  const id = await createRefundRequest({ paymentId: "p1", reason: "dup", amount: 1000.6, title: "Refund" });
  expect(id).toBe("REF-1");
  expect(mockHttp).toHaveBeenCalledWith("/refund-requests", { method: "POST", body: { record_type: "refund", title: "Refund", price: 1001, currency: "UZS", payload: { payment_id: "p1", reason: "dup" } } });
});
