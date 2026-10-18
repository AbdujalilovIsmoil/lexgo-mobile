import { ascii, crc32, utf8 } from "./bytes";
import { buildDocx } from "./docx";
import { matrixFor, SCAN_FILTERS } from "./filters";
import { defaultScanName, outputOf } from "./formats";
import { buildPdf } from "./pdf";
import { buildZip } from "./zip";

const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
const text = (b: Uint8Array) => Buffer.from(b).toString("latin1");

// Reads the central directory back, the way an unzip tool would.
function readZip(z: Uint8Array) {
  const buf = Buffer.from(z);
  const end = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = buf.readUInt16LE(end + 10);
  let p = buf.readUInt32LE(end + 16);
  const out: Record<string, Buffer> = {};
  for (let i = 0; i < count; i++) {
    const crc = buf.readUInt32LE(p + 16);
    const size = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const off = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString("utf8");
    const data = buf.subarray(off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28), off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28) + size);
    expect(crc32(data)).toBe(crc);
    out[name] = Buffer.from(data);
    p += 46 + nameLen;
  }
  return out;
}

it("crc32 matches the reference value", () => expect(crc32(ascii("123456789"))).toBe(0xcbf43926));
it("utf8 encodes multi-byte characters", () => expect(Buffer.from(utf8("Oʻzbek ъ €")).toString("utf8")).toBe("Oʻzbek ъ €"));

it("writes a zip whose entries read back with valid checksums", () => {
  const z = readZip(buildZip([{ name: "a.txt", data: ascii("hello") }, { name: "b/ü.bin", data: jpeg }]));
  expect(Object.keys(z)).toEqual(["a.txt", "b/ü.bin"]);
  expect(z["a.txt"].toString()).toBe("hello");
  expect(z["b/ü.bin"].equals(Buffer.from(jpeg))).toBe(true);
});

it("builds a PDF with one page per scan and correct xref offsets", () => {
  const pdf = buildPdf([{ bytes: jpeg, width: 1000, height: 1400 }, { bytes: jpeg, width: 1400, height: 1000 }]);
  const s = text(pdf);
  expect(s.startsWith("%PDF-1.4")).toBe(true);
  expect(s).toContain("/Count 2");
  expect(s.match(/\/Filter \/DCTDecode/g)).toHaveLength(2);
  const start = Number(/startxref\n(\d+)/.exec(s)![1]);
  expect(s.slice(start, start + 4)).toBe("xref");
  const offsets = [...s.slice(start).matchAll(/(\d{10}) 00000 n/g)].map((m) => Number(m[1]));
  offsets.forEach((o, i) => expect(s.slice(o, o + 7)).toBe(`${i + 1} 0 obj`));
  const len = Number(/\/Length (\d+) >>\nstream\n\xff/.exec(s)![1]);
  expect(len).toBe(jpeg.length);
});

it("builds a docx with a page break between scans and the images inside", () => {
  const z = readZip(buildDocx([{ bytes: jpeg, width: 800, height: 600, ext: "jpg" }, { bytes: jpeg, width: 800, height: 600, ext: "png" }]));
  expect(Object.keys(z)).toEqual(["[Content_Types].xml", "_rels/.rels", "word/document.xml", "word/_rels/document.xml.rels", "word/media/scan1.jpg", "word/media/scan2.png"]);
  const doc = z["word/document.xml"].toString();
  expect(doc.match(/<w:drawing>/g)).toHaveLength(2);
  expect(doc.match(/<w:pageBreakBefore\/>/g)).toHaveLength(1);
  expect(doc).not.toContain("w:br");
  expect([...doc.matchAll(/<wp:docPr id="(\d+)"/g)].map((m) => m[1])).toEqual(["1", "2"]);
  const ext = [...doc.matchAll(/<wp:extent cx="(\d+)" cy="(\d+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
  ext.forEach(([cx, cy]) => (expect(cx).toBeLessThanOrEqual((11906 - 1440) * 635), expect(cy).toBeLessThanOrEqual((16838 - 1440) * 635)));
  expect(z["word/_rels/document.xml.rels"].toString()).toContain('Target="media/scan2.png"');
});

it("names exports: one page keeps its format, several JPG/PNG pages become a zip", () => {
  expect(outputOf("pdf", 3, "Ish: 1/2").name).toBe("Ish_ 1_2.pdf");
  expect(outputOf("jpg", 1, "x.jpg")).toEqual({ name: "x.jpg", mime: "image/jpeg" });
  expect(outputOf("png", 2, "x")).toEqual({ name: "x.zip", mime: "application/zip" });
  expect(outputOf("docx", 1, "  ").name).toBe("scan.docx");
  expect(outputOf("pdf", 1, "Scan 2026-10-18 08.53").name).toBe("Scan 2026-10-18 08.53.pdf");
  expect(defaultScanName(new Date(2026, 9, 8, 7, 5))).toBe("Scan 2026-10-08 07-05");
});

it("has a 20-value colour matrix for every filter and keeps original untouched", () => {
  for (const f of SCAN_FILTERS) expect(matrixFor(f)).toHaveLength(20);
  expect(matrixFor("original")[0]).toBe(1);
  expect(matrixFor("bw")[0]).toBeGreaterThan(matrixFor("document")[0]);
});

it("keeps the PDF xref consistent for many pages and a large JPEG", () => {
  const big = new Uint8Array(3_000_000).fill(7);
  const pdf = buildPdf([...Array.from({ length: 30 }, () => ({ bytes: jpeg, width: 900, height: 1200 })), { bytes: big, width: 2000, height: 1500 }]);
  const s = text(pdf);
  expect(s).toContain("/Count 31");
  expect(s).toContain("xref\n0 96\n");
  const start = Number(/startxref\n(\d+)/.exec(s)![1]);
  const offsets = [...s.slice(start).matchAll(/(\d{10}) 00000 n/g)].map((m) => Number(m[1]));
  expect(offsets).toHaveLength(95);
  offsets.forEach((o, i) => expect(s.slice(o, o + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));
});
