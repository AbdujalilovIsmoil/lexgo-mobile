import { attachRule, checkAttach } from "./validate";

const MB = 1024 * 1024;
const file = (name: string, size = MB, mime = "") => ({ uri: `file:///${name}`, name, mime, size });

describe("checkAttach", () => {
  it("keeps the phone's own list and 25 MB by default", () => {
    expect(checkAttach(file("scan.jpg"), "file")).toBeNull();
    expect(checkAttach(file("table.xlsx", 25 * MB), "file")).toBeNull();
    expect(checkAttach(file("big.pdf", 26 * MB), "file")).toBe("tooBig");
    expect(checkAttach(file("run.exe"), "file")).toBe("badType");
  });
  it("takes the size limit of the document service settings", () => {
    const rule = attachRule(5);
    expect(rule.list).toBe("PDF, DOCX, TXT, XLSX, JPG, PNG");
    expect(checkAttach(file("photo.png", 6 * MB), "file", rule)).toBe("tooBig");
    expect(checkAttach(file("photo.png", 4 * MB), "file", rule)).toBeNull();
  });
  it("checks the document under review against the published formats", () => {
    const main = { mb: 25, exts: /\.(pdf|doc|docx)$/i, list: "PDF, DOC, DOCX" };
    expect(checkAttach(file("contract.DOCX"), "file", main)).toBeNull();
    expect(checkAttach(file("contract.jpg"), "file", main)).toBe("badType");
  });
  it("judges a voice note by its own rules, whatever the file rule", () => {
    const tight = attachRule(1);
    expect(checkAttach(file("voice-1.m4a", 20 * MB, "audio/mp4"), "voice", tight)).toBeNull();
    expect(checkAttach(file("voice-1.m4a", MB, "image/png"), "voice")).toBe("badType");
    expect(checkAttach(file("voice-1.m4a", 26 * MB, "audio/mp4"), "voice")).toBe("tooBig");
  });
});
