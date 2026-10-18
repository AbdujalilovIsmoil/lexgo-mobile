import { demoPdf } from "./demoPdf";

it("builds a PDF whose xref offsets point at the objects", () => {
  const pdf = demoPdf("Da'vo (arizasi).pdf");
  expect(pdf.startsWith("%PDF-1.4")).toBe(true);
  const start = Number(/startxref\n(\d+)/.exec(pdf)![1]);
  expect(pdf.slice(start, start + 4)).toBe("xref");
  const first = Number(/0000000000 65535 f \n(\d{10})/.exec(pdf)![1]);
  expect(pdf.slice(first, first + 7)).toBe("1 0 obj");
  expect(pdf).toContain("Da'vo arizasi.pdf");
});
