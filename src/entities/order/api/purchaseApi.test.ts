import { http } from "@/shared/api";
import { normPurchase, purchaseBody, requestPurchase } from "./purchaseApi";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;

describe("purchase request (Enterprise contract §3–§4)", () => {
  it("sends the web portal's fields: contact speed and urgency also in details, no provider unless one was chosen", () => {
    expect(purchaseBody({ note: " Ijara ", channel: "audio", time: "", optionIds: ["o1"], contactSpeed: "within_1_hour", urgency: "today" })).toEqual({
      selected_option_ids: ["o1"],
      note: "Ijara",
      preferred_channel: "audio",
      contact_speed: "within_1_hour",
      urgency: "today",
      details: { note: "Ijara", contact_channel: "audio", contact_speed: "within_1_hour", urgency: "today" },
    });
    expect(purchaseBody({ note: "", channel: "chat", time: "bugun 18:00" })).toEqual({ selected_option_ids: [], note: "", preferred_channel: "chat", preferred_time: "bugun 18:00" });
    expect(purchaseBody({ note: "", channel: "video", time: "", provider: "payme" })).toMatchObject({ payment_provider: "payme" });
  });

  it("reads the payment of the answer — pending until the payment itself says paid; only an https checkout is kept", () => {
    const r = normPurchase({
      work_id: "ADV-1", order: { id: "o1", status: "pending_payment", payment_status: "pending" },
      payment: { id: "p1", status: "pending", amount: 100000, currency: "UZS", provider: "telegram_manual", payment_url: "" },
      telegram_sent: true, status: "payment_pending", next_status: "full_payment_required",
    });
    expect(r).toMatchObject({ orderId: "o1", workId: "ADV-1", status: "pending_payment", amount: 100000, telegramSent: true, paymentStatus: "pending", paymentUrl: "" });
    expect(normPurchase({ order: { id: "o2" }, payment: { status: "PENDING", payment_url: "https://checkout.paycom.uz/abc" } })).toMatchObject({ paymentStatus: "pending", paymentUrl: "https://checkout.paycom.uz/abc" });
    expect(normPurchase({ order: { id: "o3" }, payment: { payment_url: "http://insecure.example" } }).paymentUrl).toBe("");
  });

  it("posts to the seller's service purchase-request with that body", async () => {
    mockHttp.mockResolvedValueOnce({ order: { id: "o1", status: "pending_payment" }, payment: { status: "pending" } });
    await requestPurchase("u 1", "s1", { note: "x", channel: "chat", time: "", contactSpeed: "today" });
    expect(mockHttp).toHaveBeenLastCalledWith("/marketplace/lawyers/u%201/services/s1/purchase-request", { method: "POST", body: expect.objectContaining({ contact_speed: "today", preferred_channel: "chat" }) });
  });
});
