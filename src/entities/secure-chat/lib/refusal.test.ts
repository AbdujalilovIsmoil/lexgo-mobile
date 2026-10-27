import { ApiError, parseErrorBody } from "@/shared/api/errors";
import { translate } from "@/shared/i18n/useT";
import { refusalText, uploadRefusal } from "./refusal";

// Bodies as the backend sends them (TZ "Secure chat file upload — current backend contract"), read the way upload.ts reads them.
const fail = (status: number, body: unknown) => parseErrorBody(status, body);
const pdf = { uri: "file:///cache/DocumentPicker/AB12.pdf", name: "Shartnoma.pdf" };
const quota = { message: "Ish maydoni hajmi tugadi", quota_bytes: 1073741824, used_bytes: 1072693248, remaining_bytes: 1048576, limit_gb: 1, incoming_size: 5242880 };

describe("uploadRefusal", () => {
  it("413 with a sentence: the file is over its limit", () => {
    expect(uploadRefusal(fail(413, { detail: "Fayl hajmi ruxsat etilgan limitdan oshdi" }), pdf)).toEqual({ kind: "size" });
    expect(uploadRefusal(fail(413, {}), pdf)).toEqual({ kind: "size" }); // a proxy's HTML page parses to {}
  });
  it("413 with the quota object: the workspace is full, as detail or as the body", () => {
    expect(uploadRefusal(fail(413, { detail: quota }), pdf)).toEqual({ kind: "quota", left: 1048576 });
    expect(uploadRefusal(fail(413, { ...quota, remaining_bytes: 0 }), pdf)).toEqual({ kind: "quota", left: 0 });
    expect(uploadRefusal(fail(413, { detail: { ...quota, remaining_bytes: -5 } }), pdf)).toEqual({ kind: "quota", left: 0 });
  });
  it("415: a type the server does not take, or a file that is not what its extension says", () => {
    expect(uploadRefusal(fail(415, { detail: "Ruxsat etilmagan fayl turi" }), { uri: "file:///c/a.gif", name: "a.gif" })).toEqual({ kind: "type" });
    expect(uploadRefusal(fail(415, { detail: "PDF imzosi noto'g'ri" }), pdf)).toEqual({ kind: "broken" });
    // what decides is the name the upload sends: the converted .jpg, not the gallery's original .HEIC
    expect(uploadRefusal(fail(415, {}), { uri: "file:///c/ImagePicker/X.jpg", name: "IMG_1.HEIC" })).toEqual({ kind: "broken" });
  });
  it("422 on a ZIP is a broken archive; a field list or another type is not a refusal", () => {
    const zip = { uri: "file:///c/a.zip", name: "docs.zip" };
    expect(uploadRefusal(fail(422, { detail: "ZIP fayl buzilgan" }), zip)).toEqual({ kind: "broken" });
    expect(uploadRefusal(fail(422, { detail: [{ loc: ["body", "file"], msg: "Field required" }] }), zip)).toBeNull();
    expect(uploadRefusal(fail(422, { detail: "x" }), pdf)).toBeNull();
  });
  it("leaves everything else to the caller", () => {
    expect(uploadRefusal(fail(409, { detail: "Chat yopilgan" }), pdf)).toBeNull();
    expect(uploadRefusal(fail(403, { detail: "Ruxsat yo'q" }), pdf)).toBeNull();
    expect(uploadRefusal(new ApiError(0, "network_error"), pdf)).toBeNull();
    expect(uploadRefusal(new Error("Network request failed"), pdf)).toBeNull();
  });
});

describe("refusalText", () => {
  const langs = ["uz", "ru", "en"] as const;
  const tr = (l: (typeof langs)[number]) => (k: string, p?: Record<string, string | number>) => translate(l, k, p);
  it("explains every refusal in each language, with nothing left unfilled", () => {
    for (const l of langs) {
      const texts = [
        refusalText(tr(l), { kind: "type" }, ["a.gif"]),
        refusalText(tr(l), { kind: "size" }, ["film.mov"]),
        refusalText(tr(l), { kind: "quota", left: 1048576 }),
        refusalText(tr(l), { kind: "quota", left: 0 }),
        refusalText(tr(l), { kind: "broken" }, ["a.pdf"]),
      ];
      for (const s of texts) {
        expect(s).not.toMatch(/[{}]|admChat\./);
        expect(s).not.toContain("Fayl hajmi"); // never the server's raw Uzbek sentence
      }
      expect(texts[0]).toContain("a.gif");
      expect(texts[0]).toContain("PDF, DOC, DOCX");
      expect(texts[1]).toContain("film.mov");
      expect(texts[1]).toMatch(/50.*200/);
      expect(texts[2]).toContain("1.0 MB");
      expect(texts[2]).not.toBe(texts[3]);
    }
  });
  it("names three files at most", () => {
    const s = refusalText(tr("en"), { kind: "type" }, ["a.gif", "b.rar", "c.7z", "d.bmp", "e.csv"]);
    expect(s).toContain("a.gif, b.rar, c.7z +2");
    expect(s).not.toContain("d.bmp");
  });
});
