import { fmtWait } from "./auth/lib/fmtWait";
import { forgotSchema, loginSchema, registerSchema } from "./auth/model/authSchemas";
import { dutySchema } from "./duty-request/model/dutySchema";
import { intakeSchema } from "./intake-analyze/model/intakeSchema";
import { claimSchema } from "./profile-extras/gifts/claimSchema";
import { giftSchema } from "./profile-extras/gifts/giftSchema";
import { complaintSchema } from "./rating/model/complaintSchema";
import { rateSchema } from "./rating/ui/rateSchema";
import { sosSchema } from "./sos-request/model/sosSchema";
import { ticketSchema } from "./support/model/ticketSchema";

const ok = (r: { success: boolean }) => r.success;
const msg = (r: { success: boolean; error?: { issues: { message: string }[] } }) => r.error?.issues[0]?.message;

describe("login / forgot", () => {
  it("needs a real Uzbek number and some password", () => {
    expect(ok(loginSchema.safeParse({ phone: "+998901234567", password: "x" }))).toBe(true);
    expect(ok(loginSchema.safeParse({ phone: "12345", password: "x" }))).toBe(false);
    expect(msg(loginSchema.safeParse({ phone: "+998901234567", password: "" }))).toBe("auth.required");
    expect(ok(forgotSchema.safeParse({ phone: "901234567" }))).toBe(true);
  });
});

describe("registerSchema", () => {
  const base = { role: "client", firstName: "Ali", lastName: "Valiyev", middleName: "", region: "tashkent", phone: "+998901234567", password: "12345678", code: "", agreed: true };
  it("accepts a complete form, including Cyrillic and apostrophe names", () => {
    expect(ok(registerSchema.safeParse(base))).toBe(true);
    expect(ok(registerSchema.safeParse({ ...base, firstName: "Ғулом", lastName: "O'ktamov" }))).toBe(true);
  });
  it("rejects bad names, short passwords, unknown regions and missing consent", () => {
    expect(ok(registerSchema.safeParse({ ...base, firstName: "A" }))).toBe(false);
    expect(ok(registerSchema.safeParse({ ...base, firstName: "Ali123" }))).toBe(false);
    expect(msg(registerSchema.safeParse({ ...base, password: "1234567" }))).toBe("auth.passwordHint");
    expect(ok(registerSchema.safeParse({ ...base, region: "mars" }))).toBe(false);
    expect(ok(registerSchema.safeParse({ ...base, role: "admin" }))).toBe(false);
    expect(msg(registerSchema.safeParse({ ...base, agreed: false }))).toBe("au1.agreeReq");
  });
});

describe("text forms", () => {
  it("intake: 8..4000 characters after trimming", () => {
    expect(ok(intakeSchema.safeParse({ text: "   short  " }))).toBe(false);
    expect(ok(intakeSchema.safeParse({ text: "Ish beruvchi maosh bermayapti" }))).toBe(true);
    expect(ok(intakeSchema.safeParse({ text: "x".repeat(4001) }))).toBe(false);
  });
  it("duty request: only 'need' is required (10+)", () => {
    expect(ok(dutySchema.safeParse({ title: "", need: "Yordam kerak, shoshilinch", extra: "" }))).toBe(true);
    expect(ok(dutySchema.safeParse({ title: "", need: "qisqa", extra: "" }))).toBe(false);
  });
  it("SOS never blocks on the description", () => {
    expect(ok(sosSchema.safeParse({ desc: "" }))).toBe(true);
    expect(ok(sosSchema.safeParse({ desc: "x".repeat(1001) }))).toBe(false);
  });
  it("support ticket: at least 3 real characters", () => {
    expect(ok(ticketSchema.safeParse({ message: "  hi " }))).toBe(false);
    expect(ok(ticketSchema.safeParse({ message: "Salom, yordam kerak" }))).toBe(true);
  });
});

describe("gifts", () => {
  it("claim code 4..24 characters", () => {
    expect(ok(claimSchema.safeParse({ code: "ABC" }))).toBe(false);
    expect(ok(claimSchema.safeParse({ code: "ABCD1234" }))).toBe(true);
    expect(ok(claimSchema.safeParse({ code: "A".repeat(25) }))).toBe(false);
  });
  it("gift: the number may be empty or just +998, but not half-typed", () => {
    expect(ok(giftSchema.safeParse({ hint: "", phone: "", message: "" }))).toBe(true);
    expect(ok(giftSchema.safeParse({ hint: "", phone: "+998 ", message: "" }))).toBe(true);
    expect(ok(giftSchema.safeParse({ hint: "", phone: "+998 90 12", message: "" }))).toBe(false);
    expect(ok(giftSchema.safeParse({ hint: "", phone: "+998 90 123 45 67", message: "" }))).toBe(true);
    expect(ok(giftSchema.safeParse({ hint: "x".repeat(81), phone: "", message: "" }))).toBe(false);
  });
});

describe("rating and complaints", () => {
  it("stars 1..5 are needed, comment and complaint are capped", () => {
    expect(ok(rateSchema.safeParse({ stars: 0, comment: "", complaint: "" }))).toBe(false);
    expect(ok(rateSchema.safeParse({ stars: 5, comment: "", complaint: "" }))).toBe(true);
    expect(ok(rateSchema.safeParse({ stars: 5, comment: "x".repeat(501), complaint: "" }))).toBe(false);
    expect(ok(rateSchema.safeParse({ stars: 1, comment: "", complaint: "x".repeat(2001) }))).toBe(false);
  });
  it("complaint: known category, 3..150 subject, 15+ description", () => {
    const base = { category: "service", subject: "Muddat buzildi", desc: "Hujjat va'da qilingan muddatda tayyor bo'lmadi" };
    expect(ok(complaintSchema.safeParse(base))).toBe(true);
    expect(ok(complaintSchema.safeParse({ ...base, category: "weird" }))).toBe(false);
    expect(ok(complaintSchema.safeParse({ ...base, subject: "ab" }))).toBe(false);
    expect(ok(complaintSchema.safeParse({ ...base, desc: "qisqa matn" }))).toBe(false);
  });
});

describe("fmtWait", () => {
  it("m:ss and h:mm:ss, rounding up and never negative", () => {
    expect(fmtWait(49)).toBe("0:49");
    expect(fmtWait(899.2)).toBe("15:00");
    expect(fmtWait(3600)).toBe("1:00:00");
    expect(fmtWait(-5)).toBe("0:00");
  });
});

