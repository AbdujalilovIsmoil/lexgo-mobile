import { ApiError, parseErrorBody } from "@/shared/api";
import type { DocRuntime, DocSettings } from "../model/types";
import { pickRule } from "./formats";
import { downloadOk, gateOf, gateText, isPlanCode, refusalCode, uploadRule } from "./gate";

const settings = (p: Partial<DocSettings> = {}): DocSettings => ({ formats: null, maxFileMb: null, includedPages: null, modes: null, downloadFormats: null, ...p });
const rt = (s: Partial<DocSettings> = {}, access: DocRuntime["access"] = null): DocRuntime => ({ settings: settings(s), access });

describe("gateOf", () => {
  it("keeps every mode open until the settings are in", () => {
    expect(gateOf(undefined, "analysis")).toEqual({ state: "open", code: "", message: "" });
    expect(gateOf(rt(), "manual").state).toBe("open");
  });
  it("a mode missing from the published list is off for a guest", () => {
    const r = rt({ modes: ["manual", "lawyer"] });
    expect(gateOf(r, "analysis")).toEqual({ state: "off", code: "document_mode_disabled", message: "" });
    expect(gateOf(r, "lawyer").state).toBe("open");
  });
  it("the account's own decision wins over the list", () => {
    const r = rt({ modes: ["manual"] }, {
      review: { allowed: true, code: "", message: "" },
      analysis: { allowed: false, code: "document_subscription_required", message: "" },
      lawyer: { allowed: false, code: "document_mode_disabled", message: "" },
      manual: { allowed: false, code: "something_new", message: "Hozir emas" },
    });
    expect(gateOf(r, "review").state).toBe("open");
    expect(gateOf(r, "analysis")).toEqual({ state: "locked", code: "document_subscription_required", message: "" });
    expect(gateOf(r, "lawyer").state).toBe("off");
    expect(gateOf(r, "manual")).toEqual({ state: "locked", code: "something_new", message: "Hozir emas" });
  });
});

describe("uploadRule / pickRule", () => {
  const own = { mb: 20, formats: ["pdf", "doc", "docx", "txt"] };
  it("takes what the settings state and keeps the screen's own for the rest", () => {
    expect(uploadRule(undefined, own)).toEqual(own);
    expect(uploadRule(rt({ maxFileMb: 25 }), own)).toEqual({ mb: 25, formats: own.formats });
    expect(uploadRule(rt({ formats: ["pdf", "docx"], maxFileMb: 5 }), own)).toEqual({ mb: 5, formats: ["pdf", "docx"] });
  });
  it("builds the picker's extensions, types and the readable list", () => {
    const p = pickRule({ mb: 25, formats: ["pdf", "doc", "docx"] });
    expect(p.maxMb).toBe(25);
    expect(p.label).toBe("PDF, DOC, DOCX");
    expect(p.types).toEqual(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
    expect(["a.pdf", "B.DOC", "c.docx"].every((n) => p.exts.test(n))).toBe(true);
    expect(["a.txt", "a.pdf.exe", "docx"].some((n) => p.exts.test(n))).toBe(false);
  });
  it("leaves the picker unfiltered when a format has no known type", () => {
    const p = pickRule({ mb: 10, formats: ["pdf", "odt"] });
    expect(p.types).toBeUndefined();
    expect(p.exts.test("x.odt")).toBe(true);
  });
});

describe("downloadOk", () => {
  it("allows everything until the settings are in, or when they name no formats", () => {
    expect(downloadOk(undefined, "docx")).toBe(true);
    expect(downloadOk(rt(), "pdf")).toBe(true);
  });
  it("follows the download formats for documents only", () => {
    const r = rt({ downloadFormats: ["pdf"] });
    expect(downloadOk(r, "pdf")).toBe(true);
    expect(downloadOk(r, "DOCX")).toBe(false);
    expect(downloadOk(r, ".doc")).toBe(false);
    expect(downloadOk(r, "png")).toBe(true); // not a document format: left to the backend
    expect(downloadOk(r, "")).toBe(true);
    expect(downloadOk(rt({ downloadFormats: [] }), "pdf")).toBe(false);
  });
});

describe("refusalCode / gateText", () => {
  it("reads the code from the structured detail, the top level or a bare detail", () => {
    expect(refusalCode(parseErrorBody(403, { detail: { code: "document_mode_disabled", message: "off" } }))).toBe("document_mode_disabled");
    expect(refusalCode(parseErrorBody(402, { detail: "Plan", code: "document_plan_not_allowed" }))).toBe("document_plan_not_allowed");
    expect(refusalCode(parseErrorBody(403, { detail: "document_download_format_disabled" }))).toBe("document_download_format_disabled");
  });
  it("is null for anything else, the 402 subscription limits included", () => {
    expect(refusalCode(parseErrorBody(402, { detail: { code: "feature_limit_exhausted" } }))).toBeNull();
    expect(refusalCode(new ApiError(0, "network_error"))).toBeNull();
    expect(refusalCode(new Error("document_mode_disabled"))).toBeNull();
  });
  it("says a known code in our words, else the backend's, else a general sentence", () => {
    const t = (k: string) => `T:${k}`;
    expect(gateText(t, { code: "document_entitlement_required", message: "x" })).toBe("T:dset.code.document_entitlement_required");
    expect(gateText(t, { code: "other", message: "Backend says" })).toBe("Backend says");
    expect(gateText(t, { code: "", message: "" })).toBe("T:dset.closedText");
  });
  it("knows which refusals a plan can lift", () => {
    expect(["document_subscription_required", "document_plan_not_allowed", "document_entitlement_required"].every(isPlanCode)).toBe(true);
    expect(isPlanCode("document_mode_disabled")).toBe(false);
  });
});
