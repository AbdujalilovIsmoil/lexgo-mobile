import { http } from "@/shared/api";
import { API_BASE } from "@/shared/config/env";
import { claimGift, createGift, listGifts } from "./gifts/api";
import { getReferral } from "./referral/api";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;

describe("gifts", () => {
  it("lists gifts, dropping rows without id and unsafe links", async () => {
    mockHttp.mockResolvedValueOnce({ items: [{ id: "g1", plan_name: "Pro", term_months: 3, share_url: "https://lexgo.uz/gift/ABC123", status: "unclaimed", direction: "received" }, { plan_name: "no id" }, { id: "g2", service_name: "Hujjat", share_url: "javascript:alert(1)" }] });
    const gifts = await listGifts();
    expect(mockHttp).toHaveBeenCalledWith("/gifts");
    expect(gifts).toHaveLength(2);
    expect(gifts[0]).toMatchObject({ title: "Pro", isService: false, termMonths: 3, code: "ABC123", direction: "received", shareUrl: "https://lexgo.uz/gift/ABC123" });
    expect(gifts[1]).toMatchObject({ title: "Hujjat", isService: true, shareUrl: "", direction: "sent" });
  });
  it("the code comes from the share link or the QR link and the QR falls back to the public PNG", async () => {
    mockHttp.mockResolvedValueOnce([{ id: "a", share_url: "https://x.uz/gift/CODE1?x=1" }, { id: "b", qr_url: "https://api.x.uz/gifts/CODE2/qr" }, { id: "c", gift_code: "CODE3" }]);
    const [a, b, c] = await listGifts();
    expect(a.code).toBe("CODE1");
    expect(b.code).toBe("CODE2");
    expect(c.qrUrl).toBe(`${API_BASE}/gifts/CODE3/qr`);
  });
  it("create sends the plan or the service, never both, and returns the payment", async () => {
    mockHttp.mockResolvedValueOnce({ id: "g", status: "pending_payment", gift_code: "K", payment: { id: "p", payment_url: "https://pay.example/1", status: "pending" } });
    const g = await createGift({ months: 3, hint: "h", phone: "+998901234567", message: "m", planSlug: "pro", serviceId: "" } as never, "atmos");
    const call = mockHttp.mock.calls.at(-1)!;
    expect(call[0]).toBe("/gifts");
    expect((call[1] as { body: Record<string, unknown> }).body).toMatchObject({ provider: "atmos", plan_slug: "pro", term_months: 3 });
    expect((call[1] as { body: Record<string, unknown> }).body).not.toHaveProperty("service_id");
    expect(g).toMatchObject({ id: "g", code: "K", paymentId: "p", paymentUrl: "https://pay.example/1" });
    mockHttp.mockResolvedValueOnce({ id: "g2" });
    await createGift({ months: 1, serviceId: "s1" } as never, "atmos");
    expect((mockHttp.mock.calls.at(-1)![1] as { body: Record<string, unknown> }).body).toMatchObject({ service_id: "s1" });
  });
  it("claim trims and encodes the code", async () => {
    mockHttp.mockResolvedValueOnce({ status: "claimed", starts_at: "a", ends_at: "b" });
    expect(await claimGift("  AB/C ")).toEqual({ status: "claimed", startsAt: "a", endsAt: "b" });
    expect(mockHttp).toHaveBeenLastCalledWith("/gifts/AB%2FC/claim", { method: "POST" });
  });
});

describe("referral", () => {
  it("reads the code, progress and invites", async () => {
    mockHttp.mockResolvedValueOnce({ code: "ALI7", link: "https://lexgo.uz/r/ALI7", qr_url: "/referrals/ALI7/qr", invited_count: 4, joined_count: 2, reward_balance: "30000", discount_unlocked: false, remaining_to_unlock: 3, applies_to: "subscription", items: [{ name: "Vali", phone: "+998", status: "joined", reward: 10000 }] });
    const r = await getReferral();
    expect(mockHttp).toHaveBeenCalledWith("/referrals/me");
    expect(r).toMatchObject({ code: "ALI7", link: "https://lexgo.uz/r/ALI7", qrUrl: `${API_BASE}/referrals/ALI7/qr`, invited: 4, joined: 2, reward: 30000, remaining: 3, eligibleAfter: 5, appliesTo: ["subscription"] });
    expect(r.items[0]).toMatchObject({ name: "Vali", status: "joined", reward: 10000 });
  });
  it("refuses a non-https share link and survives an empty answer", async () => {
    mockHttp.mockResolvedValueOnce({ code: "X", link: "http://insecure/r", qr_url: "https://cdn/x.png" });
    const r = await getReferral();
    expect(r.link).toBe("");
    expect(r.qrUrl).toBe("https://cdn/x.png");
    mockHttp.mockResolvedValueOnce(null);
    expect(await getReferral()).toMatchObject({ code: "", items: [], eligibleAfter: 5, discountUnlocked: false });
  });
});
