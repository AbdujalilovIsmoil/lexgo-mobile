import { ApiError, http, parseErrorBody } from "@/shared/api";
import { checkout, uploadBanner } from "./promotionApi";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
jest.mock("@/shared/lib/upload", () => ({ appendFile: (form: FormData, field: string, f: { name: string }) => form.append(field, f.name) }));
const mockHttp = http as jest.MockedFunction<typeof http>;
beforeEach(() => mockHttp.mockReset());

const file = { uri: "file:///cache/me.jpg", name: "me.jpg" };

describe("uploadBanner", () => {
  it("sends the app's language with the file and reads the localized check", async () => {
    mockHttp.mockResolvedValueOnce({ file_url: "/f", status: "active", vision_validation: { message: "Фото подходит", reason_codes: ["ok"] } });
    const r = await uploadBanner({ file, language: "ru" });
    const [path, init] = mockHttp.mock.calls[0];
    const body = init?.body as FormData;
    expect(path).toBe("/promotions/banner-assets");
    expect(init?.method).toBe("POST");
    expect(body.get("file")).toBe("me.jpg");
    expect(body.get("language")).toBe("ru");
    expect(r).toEqual({ fileUrl: "/f", status: "active", message: "Фото подходит", reasons: [], suggestions: [] });
  });
  it("shows a refusal that comes back as an error like any other verdict", async () => {
    mockHttp.mockRejectedValueOnce(parseErrorBody(422, { detail: { code: "banner_face_not_visible", message: "Yuz ko'rinmayapti", vision_validation: { reasons: ["Rasm xira"], suggestions: ["Qayta suratga oling"], reason_codes: ["blur"] } } }));
    expect(await uploadBanner({ file, language: "uz" })).toEqual({ fileUrl: "", status: "rejected", message: "Yuz ko'rinmayapti", reasons: ["Rasm xira"], suggestions: ["Qayta suratga oling"] });
    mockHttp.mockRejectedValueOnce(parseErrorBody(400, { detail: { vision_validation: { manual_review: true, message: "Qo'lda tekshiriladi" } } }));
    expect(await uploadBanner({ file, language: "uz" })).toMatchObject({ fileUrl: "", status: "manual_review", message: "Qo'lda tekshiriladi" });
  });
  it("passes any other failure on", async () => {
    const bad = parseErrorBody(422, { detail: { code: "promotion_language_invalid" } });
    mockHttp.mockRejectedValueOnce(bad);
    await expect(uploadBanner({ file, language: "uz" })).rejects.toBe(bad);
    mockHttp.mockRejectedValueOnce(new ApiError(502, "x", { data: { detail: { vision_validation: { message: "m" } } } }));
    await expect(uploadBanner({ file, language: "uz" })).rejects.toBeInstanceOf(ApiError);
  });
});

describe("checkout", () => {
  const base = { packageId: "p", days: 7, idempotencyKey: "k", language: "en" as const };
  it("sends the app's language on the general route", async () => {
    mockHttp.mockResolvedValueOnce({ payment_required: false });
    await checkout({ ...base, placement: "banner", bannerFileUrl: "/f" });
    expect(mockHttp).toHaveBeenLastCalledWith("/promotions/checkout", expect.objectContaining({ method: "POST", body: expect.objectContaining({ language: "en", placement: "banner", banner_file_url: "/f", provider: "telegram_manual" }) }));
  });
  it("and on the single-service route", async () => {
    mockHttp.mockResolvedValueOnce({});
    await checkout({ ...base, placement: "service_boost", serviceId: "s 1" });
    expect(mockHttp).toHaveBeenLastCalledWith("/lawyers/me/services/s%201/promotion-checkout", expect.objectContaining({ body: expect.objectContaining({ language: "en", service_id: "s 1" }) }));
  });
});
