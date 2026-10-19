import { classifyFile, exceedsPreviewLimit, sniffBlocked } from "./classifyFile";

describe("classifyFile", () => {
  it.each([
    ["a.pdf", "application/pdf", "pdf", true],
    ["scan.PDF", undefined, "pdf", true],
    ["p.jpg", "image/jpeg", "image", true],
    ["p.heic", "image/heic", "image", true],
    ["v.mp4", "video/mp4", "video", true],
    ["v.mov", undefined, "video", true],
    ["s.m4a", "audio/mp4", "audio", true],
    ["s.m4a", "video/mp4", "audio", true],
    ["a.webm", "video/webm", "video", true],
    ["n.txt", "text/plain", "text", true],
    ["n.csv", "application/vnd.ms-excel", "text", true],
    ["n.json", "application/json", "text", true],
    ["n.md", "text/markdown", "text", true],
    ["d.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "office", true],
    ["d.docx", "application/zip", "office", true],
  ])("%s %s is %s previewable=%s", (n, m, kind, prev) => {
    const c = classifyFile(n, m);
    expect(c.safe).toBe(true);
    expect(c.kind).toBe(kind);
    expect(c.previewable).toBe(prev);
  });

  it("hands Office files and archives to other apps", () => {
    for (const n of ["a.xlsx", "a.pptx", "a.odt", "a.doc", "a.zip", "a.7z"]) {
      const c = classifyFile(n);
      expect(c.safe).toBe(true);
      expect(c.previewable).toBe(false);
    }
    expect(classifyFile("a.xlsx").kind).toBe("office");
    expect(classifyFile("a.zip").kind).toBe("archive");
  });

  it("keeps unknown but harmless files with a share fallback", () => {
    expect(classifyFile("data.xyz")).toMatchObject({ kind: "other", safe: true, previewable: false });
    expect(classifyFile("README")).toMatchObject({ kind: "other", safe: true });
    expect(classifyFile("x", "application/octet-stream")).toMatchObject({ kind: "other", safe: true });
  });

  it.each(["a.exe", "a.apk", "a.bat", "a.sh", "a.js", "a.html", "a.htm", "a.svg", "a.msi", "a.jar", "a.ps1", "a.vbs", "a.dmg", "a.ipa", "a.lnk", "a.docm", "a.xlsm", "A.EXE", "a.exe.", "a.exe ", "a.php", "a.py"])("blocks %s", (n) => {
    expect(classifyFile(n)).toMatchObject({ safe: false, previewable: false, reason: "blocked_type" });
  });

  it("blocks double extensions", () => {
    expect(classifyFile("invoice.exe.pdf")).toMatchObject({ safe: false, reason: "double_ext" });
    expect(classifyFile("invoice.pdf.exe")).toMatchObject({ safe: false });
    expect(classifyFile("photo.js.png")).toMatchObject({ safe: false, reason: "double_ext" });
    expect(classifyFile("report.v2.final.pdf").safe).toBe(true);
    expect(classifyFile("scan 2026.05.12.pdf").safe).toBe(true);
  });

  it("blocks dangerous mime types whatever the name says", () => {
    for (const m of ["text/html", "image/svg+xml", "application/x-msdownload", "application/javascript", "application/vnd.android.package-archive", "application/x-sh", "application/xhtml+xml"]) {
      expect(classifyFile("doc.pdf", m)).toMatchObject({ safe: false, reason: "blocked_mime" });
    }
  });

  it("blocks extension and mime mismatch", () => {
    expect(classifyFile("a.pdf", "image/png")).toMatchObject({ safe: false, reason: "mime_mismatch" });
    expect(classifyFile("a.png", "application/pdf")).toMatchObject({ safe: false, reason: "mime_mismatch" });
    expect(classifyFile("a.mp3", "video/mp4").safe).toBe(true);
    expect(classifyFile("a.txt", "audio/mpeg").safe).toBe(false);
    expect(classifyFile("a.docx", "image/jpeg").safe).toBe(false);
  });

  it("blocks path traversal, control characters and bidi tricks in names", () => {
    for (const n of ["../../etc/passwd", "..\\evil.pdf", "a/b.pdf", "a" + String.fromCharCode(0) + ".pdf", "invoice" + String.fromCharCode(0x202e) + "fdp.exe", "a..pdf", "..", "x\n.pdf"]) {
      expect(classifyFile(n)).toMatchObject({ safe: false, reason: "unsafe_name" });
    }
  });

  it("ignores a query string in the name", () => {
    expect(classifyFile("a.pdf?token=1.exe").safe).toBe(true);
    expect(classifyFile("a.exe?x=.pdf").safe).toBe(false);
  });

  it("falls back to the mime type when the extension is missing", () => {
    expect(classifyFile("download", "application/pdf")).toMatchObject({ kind: "pdf", previewable: true });
    expect(classifyFile("download", "image/png")).toMatchObject({ kind: "image", previewable: true });
  });
});

describe("limits and sniffing", () => {
  it("limits in-app viewers by size", () => {
    expect(exceedsPreviewLimit("text", 6e6)).toBe(true);
    expect(exceedsPreviewLimit("text", 1e6)).toBe(false);
    expect(exceedsPreviewLimit("other", 9e12)).toBe(false);
  });
  const bytes = (s: string) => Array.from(s).map((ch) => ch.charCodeAt(0));
  it("detects executables and web pages by content", () => {
    expect(sniffBlocked(bytes("MZ\u0090\u0000"), "pdf")).toBe(true);
    expect(sniffBlocked([0x7f, 0x45, 0x4c, 0x46], "image")).toBe(true);
    expect(sniffBlocked(bytes("<!DOCTYPE html><html>"), "image")).toBe(true);
    expect(sniffBlocked(bytes("  <svg xmlns="), "image")).toBe(true);
    expect(sniffBlocked(bytes("#!/bin/sh"), "other")).toBe(true);
    expect(sniffBlocked(bytes("#!/bin/sh"), "text")).toBe(false);
    expect(sniffBlocked(bytes("<html>hi"), "text")).toBe(false);
    expect(sniffBlocked(bytes("%PDF-1.4"), "pdf")).toBe(false);
    expect(sniffBlocked([0x89, 0x50, 0x4e, 0x47], "image")).toBe(false);
  });
});
