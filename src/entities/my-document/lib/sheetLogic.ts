import type { FileRef } from "@/shared/ui/preview";
import type { MyDoc, UnlockPolicy } from "../model/docTypes";
import type { Step, StepState } from "./flow";
import { STEPS } from "./flow";
import type { DocCan } from "./can";
import { answerText } from "./fields";
import { priceOf, type DocPrice } from "./sections";
import { docFileName } from "./title";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// What the sheet's "Yuklab olish" can fetch: the finished file, else a DOCX of the current answers; with no file it says why.
// `allowed` is the document service's download policy (TZ.md §4): a finished file in a closed format is not offered ("format").
export type DownloadPlan = { file: FileRef | null; reason: "" | "pay" | "review" | "none" | "format" };
export function downloadOf(d: MyDoc, can: DocCan, policy?: UnlockPolicy, allowed: (format: string) => boolean = () => true): DownloadPlan {
  const base = `/document-requests/${encodeURIComponent(d.id)}`;
  if ((d.file || d.fileReady) && !allowed(d.format)) return { file: null, reason: "format" };
  if (d.file) return { file: { path: d.file.path, name: d.file.name, mime: d.file.mime || DOCX }, reason: "" };
  if (d.fileReady) return { file: { path: `${base}/file`, name: docFileName(d.title, d.format, "document"), mime: DOCX }, reason: "" };
  if (policy?.canGenerate && policy.formats.includes("docx") && allowed("docx") && !can.payWait) return { file: { path: `${base}/docx`, name: docFileName(d.title, "docx", "document"), mime: DOCX }, reason: "" };
  return { file: null, reason: can.payWait ? "pay" : can.advocate && !can.stopped ? "review" : "none" };
}

export type SheetAction = "pay" | "rate" | "review" | null;
// The one contextual action beside download: pay first, then rating (window open), then send for review.
export function actionOf(d: MyDoc, can: DocCan): SheetAction {
  if (can.pay) return "pay";
  if (d.rating.available && !d.rating.submitted) return "rate";
  return can.review ? "review" : null;
}

export type FactKey = "type" | "created" | "updated" | "price" | "language" | "pages" | "versions" | "advocate" | "deadline";
export type Fact = { key: FactKey; text?: string; iso?: string; amount?: number; price?: DocPrice["kind"]; n?: number };

// The key-facts grid: only what the backend gave us, in reading order.
export function factsOf(d: MyDoc, versions: number): Fact[] {
  const price = priceOf(d, d.paid);
  const upd = Date.parse(d.updatedAt);
  const rateOpen = d.rating.available && !d.rating.submitted && !!d.rating.deadlineAt;
  const out: (Fact | null)[] = [
    d.requestedType ? { key: "type", text: d.requestedType } : null,
    d.createdAt ? { key: "created", iso: d.createdAt } : null,
    d.updatedAt && upd - Date.parse(d.createdAt) > 60_000 ? { key: "updated", iso: d.updatedAt } : null,
    price ? { key: "price", amount: price.amount, price: price.kind } : null,
    d.language ? { key: "language", text: d.language } : null,
    d.pageCount > 0 ? { key: "pages", n: d.pageCount } : null,
    versions > 0 ? { key: "versions", n: versions } : null,
    d.lawyer ? { key: "advocate", text: d.lawyer } : null,
    rateOpen ? { key: "deadline", iso: d.rating.deadlineAt } : null,
  ];
  return out.filter((f): f is Fact => !!f);
}

export type AnswerPeek = { done: number; total: number; items: { label: string; value: string }[] };
// Filled-in share and the first few answers (long values are cut) for the sheet's summary block.
export function answersPeek(d: MyDoc, max = 3): AnswerPeek {
  const filled = d.fields.map((f) => ({ label: f.label || f.name, value: answerText(d.answers, f.name).trim() })).filter((a) => a.value);
  const cut = (v: string) => (v.length > 90 ? `${v.slice(0, 89).trimEnd()}…` : v);
  return { done: filled.length, total: d.fields.length, items: filled.slice(0, max).map((a) => ({ label: a.label, value: cut(a.value) })) };
}

// "2 / 4": the position among the steps this document really has (skipped ones do not count).
export function stepProgress(steps: Record<Step, StepState> | null): { at: number; total: number } | null {
  if (!steps) return null;
  const used = STEPS.filter((s) => steps[s] !== "skip");
  const at = used.findIndex((s) => steps[s] === "now" || steps[s] === "fail");
  return { at: at < 0 ? (used.every((s) => steps[s] === "done") ? used.length : 0) : at + 1, total: used.length };
}
