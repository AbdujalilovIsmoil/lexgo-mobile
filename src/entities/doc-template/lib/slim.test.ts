import { slimTemplate, slimTemplates } from "./slim";

const row = (o: Record<string, unknown>) => ({ id: "t1", title: "Ariza", category: "legal-doc-civil", language: "uz-cyrl", description: " Tavsif ", sections: [{}, {}], fields: [{}, {}, {}], price: "1500", updated_at: "2026-10-01", source_file_name: "ariza.docx", has_source_file: true, template_text: "x".repeat(5000), ...o });

describe("slimTemplate", () => {
  it("keeps only what the catalogue shows and counts fields and sections", () => {
    const r = slimTemplate(row({}));
    expect(r).toEqual({ id: "t1", name: "Ariza", category: "legal-doc-civil", language: "uz-cyrl", description: "Tavsif", fields: 3, sections: 2, price: 1500, updatedAt: "2026-10-01", sourceFile: "ariza.docx", hasSource: true });
    expect(JSON.stringify(r)).not.toContain("xxxx");
  });
  it("falls back to the source file's name, never the id", () => {
    expect(slimTemplate(row({ title: "  ", source_file_name: "Ijara shartnomasi.docx" })).name).toBe("Ijara shartnomasi");
  });
  it("has no source when there is no file", () => {
    expect(slimTemplate(row({ has_source_file: false, source_file_name: "" })).hasSource).toBe(false);
  });
});

describe("slimTemplates", () => {
  it("parses the answer text, drops rows without an id or a name", () => {
    const out = slimTemplates(JSON.stringify([row({}), row({ id: "" }), row({ id: "t3", title: "", source_file_name: "" })]));
    expect(out.map((x) => x.id)).toEqual(["t1"]);
  });
  it("reads a wrapped list too", () => {
    expect(slimTemplates(JSON.stringify({ items: [row({})] }))).toHaveLength(1);
    expect(slimTemplates("{}")).toEqual([]);
  });
});
