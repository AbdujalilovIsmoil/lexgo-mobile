import { docCan } from "./can";
import { flowOf, STEPS } from "./flow";
import { chatPath, callPath, docPath, ratePath } from "./paths";
import { priceOf, sectionize } from "./sections";
import { groupOf, needsClient, toneOf } from "./status";
import { cleanTitle, docFileName } from "./title";
import type { MyDoc } from "../model/docTypes";
import type { DocRow } from "../model/types";

const row = (p: Partial<DocRow>): DocRow => ({ id: "1", status: "draft", mode: "manual", lawyerActive: false, lawyer: "", paymentRequired: false, fileReady: false, price: 0, ...p }) as unknown as DocRow;
const doc = (p: Partial<MyDoc>): MyDoc => ({ status: "draft", fields: [{}], ctor: null, canSend: false, templateId: "t", paymentRequired: false, requiresPayment: false, paid: false, price: 0, lawyerActive: false, mode: "manual", lawyer: "", ...p }) as unknown as MyDoc;

describe("status groups", () => {
  it("groupOf / toneOf / needsClient", () => {
    expect(groupOf("FILE_READY")).toBe("ready");
    expect(groupOf("payment_pending")).toBe("payment");
    expect(groupOf("claimed")).toBe("review");
    expect(groupOf("payment_rejected")).toBe("closed");
    expect(groupOf("mystery")).toBe("draft");
    expect(toneOf("payment_rejected")).toBe("err");
    expect(toneOf("file_ready")).toBe("ok");
    expect(toneOf("closed")).toBe("gray");
    expect(needsClient("draft")).toBe(true);
    expect(needsClient("lawyer_review")).toBe(false);
  });
});

describe("docCan", () => {
  it("a draft with fields can be edited and versioned, not paid until the server says so", () => {
    expect(docCan(doc({ status: "draft" }))).toMatchObject({ edit: true, pay: false, stopped: false });
  });
  it("a finished or closed document is never edited again", () => {
    expect(docCan(doc({ status: "file_ready", ctor: { available: true } as never })).edit).toBe(false);
    expect(docCan(doc({ status: "closed", ctor: { available: true } as never })).edit).toBe(false);
  });
  it("a stopped payment blocks everything", () => {
    expect(docCan(doc({ status: "payment_cancelled" }))).toMatchObject({ edit: false, stopped: true, pay: false });
  });
  it("pay needs a price, an unpaid state, and not already waiting", () => {
    const base = { status: "draft", requiresPayment: true, price: 50000 };
    expect(docCan(doc(base)).pay).toBe(true);
    expect(docCan(doc({ ...base, paid: true })).pay).toBe(false);
    expect(docCan(doc(base), { paid: true } as never).pay).toBe(false);
    expect(docCan(doc({ ...base, price: 0 })).pay).toBe(false);
    expect(docCan(doc({ ...base, paymentRequired: true })).pay).toBe(false);
  });
  it("review only with a template, send permission and no payment wait", () => {
    expect(docCan(doc({ canSend: true })).review).toBe(true);
    expect(docCan(doc({ canSend: true, templateId: "" })).review).toBe(false);
    expect(docCan(doc({ canSend: true, status: "awaiting_payment" })).review).toBe(false);
  });
  it("no review while the platform keeps the review mode off", () => {
    expect(docCan(doc({ canSend: true }), undefined, true).review).toBe(false);
  });
  it("advocate when one holds the request", () => {
    expect(docCan(doc({ mode: "lawyer" })).advocate).toBe(true);
    expect(docCan(doc({ lawyer: "Ali" })).advocate).toBe(true);
    expect(docCan(doc({})).advocate).toBe(false);
  });
});

describe("flowOf", () => {
  it("manual draft: fill now, review skipped", () => {
    expect(flowOf(row({ status: "draft" }))).toEqual({ fill: "now", pay: "skip", review: "skip", ready: "todo" });
  });
  it("paid advocate request in review: fill and pay done, review now", () => {
    expect(flowOf(row({ status: "lawyer_review", mode: "lawyer", paymentRequired: true }))).toEqual({ fill: "done", pay: "done", review: "now", ready: "todo" });
  });
  it("ready finishes every needed step; a cancelled payment fails at pay", () => {
    expect(Object.values(flowOf(row({ status: "file_ready", fileReady: true }))!).filter((x) => x === "now")).toEqual([]);
    expect(flowOf(row({ status: "payment_cancelled" }))!.pay).toBe("fail");
  });
  it("a closed request with no file shows no flow", () => {
    expect(flowOf(row({ status: "closed", fileReady: false }))).toBeNull();
    expect(STEPS).toEqual(["fill", "pay", "review", "ready"]);
  });
});

describe("sectionize / priceOf", () => {
  it("waiting-on-you rows first with headers, only when something waits", () => {
    const a = row({ id: "a", status: "draft" });
    const b = row({ id: "b", status: "file_ready", fileReady: true });
    expect(sectionize([b, a]).map((i) => i.id)).toEqual(["h-you", "a", "h-rest", "b"]);
    expect(sectionize([b]).map((i) => i.id)).toEqual(["b"]);
    expect(sectionize([a]).map((i) => i.id)).toEqual(["h-you", "a"]);
  });
  it("footer money line", () => {
    expect(priceOf(row({ status: "payment_cancelled", price: 5 }), false)).toEqual({ kind: "off", amount: 5 });
    expect(priceOf(row({ paymentRequired: true, price: 5 }), false)).toEqual({ kind: "wait", amount: 5 });
    expect(priceOf(row({ price: 5, fileReady: true }), true)).toEqual({ kind: "paid", amount: 5 });
    expect(priceOf(row({ price: 5, fileReady: true }), false)).toEqual({ kind: "info", amount: 5 });
    expect(priceOf(row({ price: 0 }), false)).toEqual({ kind: "none", amount: 0 });
    expect(priceOf(row({ price: 0, mode: "lawyer" }), false)).toBeNull();
  });
});

describe("titles and paths", () => {
  it("cleans file-name leftovers and bare uuids", () => {
    expect(cleanTitle("_Ariza  namunasi.docx")).toBe("Ariza namunasi");
    expect(cleanTitle("3e3a1b2c-1111-4222-8333-444455556666")).toBe("");
    expect(cleanTitle("Shartnoma.")).toBe("Shartnoma");
    expect(cleanTitle("")).toBe("");
  });
  it("download names carry the real extension and no path characters", () => {
    expect(docFileName("A/B:C", "pdf", "document")).toBe("A B C.pdf");
    expect(docFileName("", "", "document")).toBe("document.docx");
    expect(docFileName("x", ".pdf", "d")).toBe("x.pdf");
  });
  it("paths are encoded", () => {
    expect(docPath("a/b")).toBe("/documents/a%2Fb");
    expect(chatPath("r 1")).toBe("/chat/r%201");
    expect(callPath("r", "c")).toBe("/call/r?callId=c");
    expect(ratePath("ADV-1")).toBe("/rate/ADV-1");
  });
});
