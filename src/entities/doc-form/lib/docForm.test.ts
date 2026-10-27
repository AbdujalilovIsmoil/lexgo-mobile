import { ApiError, parseErrorBody } from "@/shared/api";
import { classify } from "./classify";
import { daysIn, fmtDoc, maskDoc, monthCells, parseDoc } from "./dateParts";
import { missingFromError } from "./missingFromError";
import { sectionErrors, sectionFilled, validateField } from "./validate";
import { isFilled, isoToDoc, toWire, wireValue } from "./values";
import type { DocField, DocSection } from "../model/types";

const f = (p: Partial<DocField>): DocField => ({ key: "k", label: "K", type: "text", required: false, options: [], order: 0, ...p });

describe("dates", () => {
  it("parses only real calendar days", () => {
    expect(parseDoc("21.09.2026")).toEqual({ y: 2026, m: 9, d: 21 });
    expect(parseDoc("29.02.2024")).toEqual({ y: 2024, m: 2, d: 29 });
    for (const bad of ["29.02.2026", "31.04.2026", "00.01.2026", "01.13.2026", "1.1.2026", "2026-09-21", "", "01.01.0999"]) expect(parseDoc(bad)).toBeNull();
  });
  it("formats and masks", () => {
    expect(fmtDoc({ y: 2026, m: 9, d: 5 })).toBe("05.09.2026");
    expect(maskDoc("21092026")).toBe("21.09.2026");
    expect(maskDoc("2109")).toBe("21.09");
    expect(maskDoc("21")).toBe("21");
    expect(maskDoc("ab21-09/2026999")).toBe("21.09.2026");
  });
  it("month grid is Monday-first", () => {
    expect(daysIn(2024, 2)).toBe(29);
    const cells = monthCells(2026, 10); // 1 Oct 2026 is a Thursday
    expect(cells.slice(0, 4)).toEqual([null, null, null, 1]);
    expect(cells.filter((c) => c).length).toBe(31);
  });
  it("converts an ISO draft to the court form", () => {
    expect(isoToDoc("2026-09-21")).toBe("21.09.2026");
    expect(isoToDoc("21.09.2026")).toBe("21.09.2026");
  });
});

describe("wireValue / toWire", () => {
  it("trims, converts dates, normalises phones, strips trailing blanks in long text", () => {
    expect(wireValue(f({ type: "date" }), "2026-09-21")).toBe("21.09.2026");
    expect(wireValue(f({ type: "phone" }), "901234567")).toBe("+998 90 123 45 67");
    expect(wireValue(f({ type: "phone" }), "+998")).toBe("");
    expect(wireValue(f({ type: "textarea" }), "a  \nb \t")).toBe("a\nb");
    expect(wireValue(f({}), undefined)).toBe("");
    expect(isFilled(f({}), "   ")).toBe(false);
  });
  it("toWire keeps only answered fields", () => {
    expect(toWire([f({ key: "a" }), f({ key: "b" }), f({ key: "c", type: "date" })], { a: " x ", b: " ", c: "2026-01-02" })).toEqual({ a: "x", c: "02.01.2026" });
  });
});

describe("validateField", () => {
  it("required vs optional empties", () => {
    expect(validateField(f({ required: true }), "")).toBe("required");
    expect(validateField(f({ required: true }), "  ")).toBe("required");
    expect(validateField(f({}), "")).toBe("");
  });
  it("type formats", () => {
    expect(validateField(f({ type: "email" }), "a@b.uz")).toBe("");
    expect(validateField(f({ type: "email" }), "a@b")).toBe("email");
    expect(validateField(f({ type: "date" }), "31.02.2026")).toBe("date");
    expect(validateField(f({ type: "phone" }), "12345")).toBe("phone");
    expect(validateField(f({ type: "tel" }), "90 123 45 67")).toBe("");
  });
  it("pattern, length and numeric range", () => {
    expect(validateField(f({ pattern: "^\\d+$" }), "12a")).toBe("pattern");
    expect(validateField(f({ pattern: "(" }), "anything")).toBe(""); // a broken pattern is ignored
    expect(validateField(f({ minLength: 3 }), "ab")).toBe("short");
    expect(validateField(f({ maxLength: 3 }), "abcd")).toBe("long");
    expect(validateField(f({ type: "number", min: 1, max: 10 }), "0")).toBe("min");
    expect(validateField(f({ type: "number", min: 1, max: 10 }), "11")).toBe("max");
    expect(validateField(f({ type: "number", min: 1, max: 10 }), "1 0")).toBe("");
    expect(validateField(f({ type: "number", min: 1, max: 10 }), "2,5")).toBe("");
  });
  it("section helpers", () => {
    const s: DocSection = { id: "s", title: "S", order: 0, fields: [f({ key: "a", required: true }), f({ key: "b" })] };
    expect(sectionErrors(s, { b: "x" })).toEqual({ a: "required" });
    expect(sectionFilled(s, { a: "1", b: " " })).toBe(1);
  });
});

describe("failures", () => {
  it("classify maps statuses", () => {
    expect(classify(new ApiError(402, "plan")).kind).toBe("plan");
    expect(classify(parseErrorBody(402, { detail: { code: "feature_limit_exhausted", feature_key: "document_constructor", limit: 3, used: 3 } })).gate).toMatchObject({ code: "feature_limit_exhausted", featureKey: "document_constructor", limit: 3, used: 3 });
    expect(classify(new ApiError(422, "m")).kind).toBe("missing");
    expect(classify(new ApiError(403)).kind).toBe("auth");
    expect(classify(new ApiError(429)).kind).toBe("busy");
    expect(classify(new ApiError(0)).kind).toBe("network");
    expect(classify(new ApiError(500)).kind).toBe("other");
    expect(classify(new Error("x"))).toEqual({ kind: "other", message: "" });
  });
  it("missingFromError reads only a 422", () => {
    const e = new ApiError(422, "m", { data: { detail: { missing_required_fields: [{ key: "a", label: "A" }] } } });
    expect(missingFromError(e)).toEqual([{ key: "a", label: "A" }]);
    expect(missingFromError(new ApiError(500, "m", { data: { detail: { missing_required_fields: [{ key: "a" }] } } }))).toEqual([]);
    expect(missingFromError(null)).toEqual([]);
  });
});
