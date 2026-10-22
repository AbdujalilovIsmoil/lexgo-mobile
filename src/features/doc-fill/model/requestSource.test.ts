import { toWire, type DocField } from "@/entities/doc-form";
import type { MyDoc } from "@/entities/my-document";
import { docToGenerated, mergeAnswers, schemaFromDoc, serverAnswers } from "./requestSource";

// The entities' barrels pull in native UI; the pure parts under test need only these.
jest.mock("@/entities/doc-form", () => ({ toWire: jest.requireActual("@/entities/doc-form/lib/values").toWire }));
jest.mock("@/entities/my-document", () => ({
  answerText: (a: Record<string, unknown>, k: string) => (a[k] == null ? "" : String(a[k])),
  saveAnswers: jest.fn(),
  previewAnswers: jest.fn(),
  generateDoc: jest.fn(),
}));

const f = (name: string, o: Partial<{ label: string; type: string; required: boolean; section: string; sectionOrder: number; order: number }> = {}) =>
  ({ name, label: o.label ?? name, type: o.type ?? "text", required: o.required ?? false, placeholder: "", options: [], section: o.section ?? "", sectionOrder: o.sectionOrder ?? 0, order: o.order ?? 0 });
const doc = (o: Partial<MyDoc>): MyDoc => ({ id: "r1", workId: "DOC-1", title: "Ariza", status: "draft", mode: "manual", price: 0, paid: false, requiresPayment: false, format: "", file: null, fields: [], answers: {}, ...o } as unknown as MyDoc);

describe("schemaFromDoc", () => {
  it("groups the flat questionnaire into the backend's sections and orders", () => {
    const d = doc({ fields: [f("b", { section: "Two", sectionOrder: 2, order: 1 }), f("a2", { section: "One", sectionOrder: 1, order: 2, required: true }), f("a1", { section: "One", sectionOrder: 1, order: 1 }), f("x")] });
    const s = schemaFromDoc(d, { templateId: "t1", title: "T", extraTitle: "More" });
    expect(s.sections.map((x) => x.title)).toEqual(["One", "Two", "More"]);
    expect(s.sections[0].fields.map((x) => x.key)).toEqual(["a1", "a2"]);
    expect(s.requiredCount).toBe(1);
    expect(s.templateId).toBe("t1");
  });
});

describe("answers", () => {
  const fields: DocField[] = [{ key: "a", label: "A", type: "text", required: true, options: [], order: 1 }, { key: "b", label: "B", type: "text", required: false, options: [], order: 2 }];
  it("reads the server's answers as strings, only for the schema's fields", () => {
    expect(serverAnswers({ answers: { a: "x", b: "", zzz: "no" } }, fields)).toEqual({ a: "x" });
    expect(serverAnswers({ answers: { a: 5 } }, fields)).toEqual({ a: "5" });
  });
  it("puts the local draft's non-empty answers over the server's and keeps what only the server has", () => {
    expect(mergeAnswers({ a: "srv", b: "kept" }, { a: "local", b: "  " })).toEqual({ a: "local", b: "kept" });
    expect(mergeAnswers({ a: "srv" }, undefined)).toEqual({ a: "srv" });
  });
  it("the autosave baseline is the server's answers in the wire form", () => {
    expect(JSON.stringify(toWire(fields, { a: "x", b: "" }))).toBe('{"a":"x"}');
  });
});

describe("docToGenerated", () => {
  it("turns the finished request into the wizard's result with the request's own file", () => {
    const g = docToGenerated(doc({ title: "Ariza", format: "docx", file: { name: "Ariza.docx", mime: "application/x", path: "/document-requests/r1/file" }, paid: true }));
    expect(g).toMatchObject({ requestId: "r1", workId: "DOC-1", paid: true });
    expect(g.file).toEqual({ name: "Ariza.docx", mime: "application/x", path: "/document-requests/r1/file", format: "docx" });
  });
  it("has no file until the backend made one, and tolerates a status it does not know", () => {
    const g = docToGenerated(doc({ status: "brand_new_status" }));
    expect(g.file).toBeNull();
    expect(g.status).toBe("brand_new_status");
    expect(docToGenerated(doc({ requiresPayment: true, paid: false })).paid).toBe(false);
  });
});
