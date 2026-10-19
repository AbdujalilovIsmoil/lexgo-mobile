import { extOf, fileKind } from "./fileKind";

describe("fileKind", () => {
  it("reads the extension case-insensitively", () => {
    expect(extOf("Report.FINAL.PDF")).toBe("pdf");
    expect(extOf("noext")).toBe("");
    expect(extOf(".hidden")).toBe("");
    expect(extOf("a/b\\c.txt")).toBe("txt");
  });
  it("maps the common types", () => {
    expect(fileKind("a.pdf").kind).toBe("pdf");
    expect(fileKind("a.docx").kind).toBe("doc");
    expect(fileKind("a.xls").kind).toBe("sheet");
    expect(fileKind("a.JPG").kind).toBe("image");
    expect(fileKind("a.zip").kind).toBe("archive");
    expect(fileKind("a.txt").kind).toBe("text");
    expect(fileKind("a.pptx").kind).toBe("slides");
  });
  it("falls back to the MIME type when the name has no usable extension", () => {
    expect(fileKind("scan", "application/pdf").kind).toBe("pdf");
    expect(fileKind("photo", "image/heic").kind).toBe("image");
    expect(fileKind("x", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").kind).toBe("sheet");
    expect(fileKind("x", "application/zip").kind).toBe("archive");
  });
  it("is generic for unknown files", () => {
    const k = fileKind("a.xyz", "application/octet-stream");
    expect(k.kind).toBe("file");
    expect(k.icon).toBe("file");
  });
});
