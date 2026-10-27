import { actionOf, answersPeek, downloadOf, factsOf, stepProgress } from "./sheetLogic";
import { docCan } from "./can";
import { flowOf } from "./flow";
import type { MyDoc } from "../model/docTypes";

const rating = { available: false, submitted: false, value: 0, comment: "", deadlineAt: "", remainingSeconds: 0, closedReason: "" };
const doc = (p: Partial<MyDoc>): MyDoc => ({ id: "7", title: "Ariza", status: "draft", format: "docx", fields: [], answers: {}, ctor: null, canSend: false, templateId: "", paymentRequired: false, requiresPayment: false, paid: false, price: 0, lawyerActive: false, mode: "manual", lawyer: "", fileReady: false, file: null, rating, createdAt: "2026-10-01T10:00:00Z", updatedAt: "", pageCount: 0, requestedType: "", language: "", ...p }) as unknown as MyDoc;

describe("downloadOf", () => {
  it("prefers the finished file", () => {
    const d = doc({ status: "file_ready", fileReady: true, file: { name: "a.docx", mime: "", path: "/x/file" } });
    expect(downloadOf(d, docCan(d)).file?.path).toBe("/x/file");
  });
  it("falls back to the file endpoint when ready without file info", () => {
    const d = doc({ status: "file_ready", fileReady: true });
    expect(downloadOf(d, docCan(d)).file?.path).toBe("/document-requests/7/file");
  });
  it("offers a draft DOCX only when the policy allows it", () => {
    const d = doc({});
    const policy = { paid: false, requiresPayment: false, canGenerate: true, amount: 0, currency: "UZS", formats: ["docx"], missing: [] };
    expect(downloadOf(d, docCan(d), policy).file?.path).toBe("/document-requests/7/docx");
    expect(downloadOf(d, docCan(d))).toEqual({ file: null, reason: "none" });
  });
  it("keeps a file in a format the document service closed, and says so", () => {
    const pdfOnly = (f: string) => f !== "docx";
    const ready = doc({ status: "file_ready", fileReady: true, format: "docx", file: { name: "a.docx", mime: "", path: "/x/file" } });
    expect(downloadOf(ready, docCan(ready), undefined, pdfOnly)).toEqual({ file: null, reason: "format" });
    const pdf = doc({ status: "file_ready", fileReady: true, format: "pdf" });
    expect(downloadOf(pdf, docCan(pdf), undefined, pdfOnly).file?.path).toBe("/document-requests/7/file");
    const draft = doc({});
    const policy = { paid: false, requiresPayment: false, canGenerate: true, amount: 0, currency: "UZS", formats: ["docx"], missing: [] };
    expect(downloadOf(draft, docCan(draft), policy, pdfOnly)).toEqual({ file: null, reason: "none" });
  });
  it("explains a missing file by payment or advocate", () => {
    const p = doc({ status: "payment_pending", paymentRequired: true });
    expect(downloadOf(p, docCan(p)).reason).toBe("pay");
    const l = doc({ status: "claimed", mode: "lawyer" });
    expect(downloadOf(l, docCan(l)).reason).toBe("review");
  });
});

describe("actionOf", () => {
  it("pay > rate > review > none", () => {
    const pay = doc({ requiresPayment: true, price: 5000 });
    expect(actionOf(pay, docCan(pay))).toBe("pay");
    const rate = doc({ status: "file_ready", rating: { ...rating, available: true } });
    expect(actionOf(rate, docCan(rate))).toBe("rate");
    const rev = doc({ canSend: true, templateId: "t" });
    expect(actionOf(rev, docCan(rev))).toBe("review");
    expect(actionOf(doc({}), docCan(doc({})))).toBeNull();
  });
});

describe("factsOf", () => {
  it("keeps only what is known", () => {
    const keys = factsOf(doc({ pageCount: 3, lawyer: "A. Karimov", language: "uz" }), 2).map((f) => f.key);
    expect(keys).toEqual(["created", "price", "language", "pages", "versions", "advocate"]);
  });
  it("shows updated only when it differs and the deadline only while rating is open", () => {
    const f = factsOf(doc({ updatedAt: "2026-10-02T10:00:00Z", rating: { ...rating, available: true, deadlineAt: "2026-10-03T00:00:00Z" } }), 0);
    expect(f.map((x) => x.key)).toEqual(expect.arrayContaining(["updated", "deadline"]));
    expect(factsOf(doc({ updatedAt: "2026-10-01T10:00:10Z" }), 0).some((x) => x.key === "updated")).toBe(false);
  });
});

describe("answersPeek / stepProgress", () => {
  it("counts filled answers and cuts long ones", () => {
    const fields = ["a", "b", "c"].map((n) => ({ name: n, label: n.toUpperCase() }));
    const p = answersPeek(doc({ fields: fields as never, answers: { a: "x".repeat(200), c: "ok" } }));
    expect(p.done).toBe(2);
    expect(p.total).toBe(3);
    expect(p.items[0].value.length).toBeLessThanOrEqual(90);
    expect(p.items[1]).toEqual({ label: "C", value: "ok" });
  });
  it("positions among the used steps", () => {
    expect(stepProgress(flowOf(doc({ status: "draft" })))).toEqual({ at: 1, total: 2 });
    expect(stepProgress(flowOf(doc({ status: "claimed", mode: "lawyer" })))).toEqual({ at: 2, total: 3 });
    expect(stepProgress(null)).toBeNull();
  });
});
