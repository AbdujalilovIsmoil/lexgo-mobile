import { safeUploadName, uploadDirName } from "./safeName";

it("keeps plain names and the extension", () => {
  expect(safeUploadName("photo-12.jpg")).toBe("photo-12.jpg");
  expect(safeUploadName("Scan_2026-10-18_08.49.pdf")).toBe("Scan_2026-10-18_08.49.pdf");
});
it("turns spaces and symbols into single underscores", () => {
  expect(safeUploadName("Scan 2026-10-18 08.49.pdf")).toBe("Scan_2026-10-18_08.49.pdf");
  expect(safeUploadName("a  b / c?.docx")).toBe("a_b_c.docx");
});
it("transliterates Cyrillic and drops Uzbek apostrophes and accents", () => {
  expect(safeUploadName("Шартнома №5.pdf")).toBe("Shartnoma_5.pdf");
  expect(safeUploadName("Oʻzbekiston da'vo.pdf")).toBe("Ozbekiston_davo.pdf");
  expect(safeUploadName("café.png")).toBe("cafe.png");
});
it("never returns an empty name", () => {
  expect(safeUploadName("???.pdf")).toBe("file.pdf");
  expect(safeUploadName("")).toBe("file");
});

describe("edge cases", () => {
  const n = safeUploadName;
  it("handles uppercase Cyrillic and Uzbek letters", () => {
    expect(n("ШАРТНОМА.PDF")).toBe("SHARTNOMA.pdf");
    expect(n("Ёлка Щука.pdf")).toBe("Yolka_Shchuka.pdf");
    expect(n("ЎҚҒҲ.pdf")).toBe("OQGH.pdf");
  });
  it("drops all apostrophe variants", () => {
    expect(n("Oʻzbek ʼ ‘x’ o'z.pdf")).toBe("Ozbek_x_oz.pdf");
  });
  it("strips Latin diacritics and maps special letters", () => {
    expect(n("Müller Ångström.docx")).toBe("Muller_Angstrom.docx");
    expect(n("straße øl.pdf")).toBe("strasse_ol.pdf");
  });
  it("replaces emoji, RTL and symbols", () => {
    expect(n("😀 photo 😀.jpg")).toBe("photo.jpg");
    expect(n("مستند.pdf")).toBe("file.pdf");
    expect(n("100%.pdf")).toBe("100.pdf");
    expect(n("Scan%202026.pdf")).toBe("Scan_202026.pdf");
  });
  it("keeps an extension-only name's extension", () => {
    expect(n(".pdf")).toBe("file.pdf");
    expect(n(".PDF")).toBe("file.pdf");
  });
  it("handles no extension, trailing dots and spaces", () => {
    expect(n("README")).toBe("README");
    expect(n("report.pdf.")).toBe("report.pdf");
    expect(n("report.pdf  ")).toBe("report.pdf");
    expect(n("name . pdf")).toBe("name.pdf");
    expect(n("...")).toBe("file");
  });
  it("neutralises path separators", () => {
    expect(n("../../etc/passwd.txt")).toBe("etc_passwd.txt");
    expect(n("a\\b/c.pdf")).toBe("a_b_c.pdf");
  });
  it("avoids reserved Windows names", () => {
    expect(n("CON.pdf")).toBe("file_CON.pdf");
    expect(n("com1")).toBe("file_com1");
  });
  it("keeps long extensions inside the name and double extensions", () => {
    expect(n("notes.markdown")).toBe("notes.markdown");
    expect(n("a.tar.gz")).toBe("a.tar.gz");
    expect(n("v1.2.3 final.docx")).toBe("v1.2.3_final.docx");
    expect(n("IMG_0001.JPEG")).toBe("IMG_0001.jpeg");
  });
  it("truncates very long stems but keeps the extension", () => {
    const out = n(`${"a".repeat(300)}.pdf`);
    expect(out).toBe(`${"a".repeat(80)}.pdf`);
  });
  it("is idempotent", () => {
    for (const x of ["Scan 2026.pdf", "Шартнома №5.PDF", ".pdf", "a.tar.gz", "CON.txt"]) expect(n(n(x))).toBe(n(x));
  });
});

describe("uploadDirName", () => {
  it("differs for calls in the same millisecond with the same random", () => {
    const a = uploadDirName(1, 0.5);
    const b = uploadDirName(1, 0.5);
    expect(a).not.toBe(b);
    expect(a).toMatch(/^up-1-\d+-[0-9a-z]+$/);
  });
});
