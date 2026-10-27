import { normBannerCheck, normCatalog, normCheckout } from "./normalize";
import { normStatus } from "./normStatus";

describe("normCatalog", () => {
  it("keeps active packages of the asked placement and reads reach from the payload", () => {
    const c = normCatalog({ items: [
      { id: "a", title: "A", price: 100, days: 7, placement: "profile_boost", payload: { reach: 3 } },
      { id: "b", title: "B", price: 200, days: 7, placement: "service_boost", status: "active" },
      { id: "c", title: "C", price: 300, days: 7, placement: "profile_boost", status: "archived" },
    ] }, "profile_boost");
    expect(c.items.map((p) => [p.id, p.reach])).toEqual([["a", 3]]);
  });
});

describe("normBannerCheck", () => {
  it("reads status, reasons and suggestions", () => {
    const r = normBannerCheck({ file_url: "u", status: "manual_review", vision_validation: { reasons: ["blur", { message: "dark" }], suggestions: ["retake"] } });
    expect(r).toEqual({ fileUrl: "u", status: "manual_review", message: "", reasons: ["blur", "dark"], suggestions: ["retake"] });
  });
  it("keeps only the backend's localized texts: the message, reasons and suggestions, never the reason codes", () => {
    const r = normBannerCheck({
      file_url: "u",
      status: "rejected",
      vision_validation: { message: " Yuz aniq ko'rinmayapti ", reasons: ["Yuz aniq ko'rinmayapti", " Rasm qorong'i "], suggestions: ["Yorug' joyda suratga oling"], reason_codes: ["face_not_visible", "too_dark"] },
    });
    expect(r).toEqual({ fileUrl: "u", status: "rejected", message: "Yuz aniq ko'rinmayapti", reasons: ["Rasm qorong'i"], suggestions: ["Yorug' joyda suratga oling"] });
    expect(JSON.stringify(r)).not.toContain("face_not_visible");
  });
  it("reads the message of a wrapped asset", () => {
    expect(normBannerCheck({ asset: { file_url: "x", status: "active", vision_validation: { message: "Rasm mos" } } })).toMatchObject({ fileUrl: "x", status: "active", message: "Rasm mos" });
  });
  it("treats an unknown status as passed and reads a wrapped asset", () => {
    expect(normBannerCheck({ asset: { file_url: "x" } }).status).toBe("active");
    expect(normBannerCheck({ file_url: "x", status: "rejected" }).status).toBe("rejected");
  });
});

describe("normCheckout", () => {
  it("is live at once when no payment is required", () => {
    const r = normCheckout({ payment_required: false, checkout_request_id: "r1", package: { price: 5000 } });
    expect(r).toMatchObject({ activated: true, telegramSent: false, requestId: "r1", amount: 5000 });
  });
  it("is waiting when Telegram got the request", () => {
    expect(normCheckout({ payment_gate: { id: "g", telegram_sent: true, amount: 10 } })).toMatchObject({ activated: false, telegramSent: true, requestId: "g" });
  });
  it("is not sent when Telegram refused", () => {
    expect(normCheckout({ payment_required: true, checkout_request_id: "r", payment_gate: { telegram_sent: false } })).toMatchObject({ activated: false, telegramSent: false });
  });
});

describe("normStatus", () => {
  it("falls back to by_placement and drops repeats", () => {
    const run = { id: "1", placement: "banner", days_left: 3 };
    const s = normStatus({ items: [], by_placement: { banner: [run], profile_boost: [], service_boost: [] } });
    expect(s.items.map((r) => r.id)).toEqual(["1"]);
    expect(normStatus({ items: [run], by_placement: { banner: [run] } }).items).toHaveLength(1);
  });
});
