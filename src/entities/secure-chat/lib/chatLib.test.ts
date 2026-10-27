import { fmtSize } from "./fmtSize";
import { ALLOWED_LIST, CHAT_EXTS, MAX_MB, VIDEO_MAX_MB, isAllowedName, maxMbFor, screenFiles, sentExt } from "./fileRules";
import { maskContacts } from "./maskContacts";
import { listStamp } from "./stamp";

describe("maskContacts", () => {
  it("hides links, handles and phone numbers", () => {
    expect(maskContacts("yozing t.me/ali_vali")).toBe("yozing •••");
    expect(maskContacts("sayt https://evil.example/x?y=1 bor")).toBe("sayt ••• bor");
    expect(maskContacts("menga @ali_vali yozing")).toBe("menga ••• yozing");
    expect(maskContacts("+998 90 123 45 67")).toBe("•••");
    expect(maskContacts("tel: 90-123-45-67")).toBe("tel: •••");
  });
  it("lets Zoom links through and leaves plain text alone", () => {
    expect(maskContacts("https://us02web.zoom.us/j/123")).toBe("https://us02web.zoom.us/j/123");
    expect(maskContacts("Salom, ertaga 5 soatda")).toBe("Salom, ertaga 5 soatda");
    expect(maskContacts("narx 1 250 000")).toBe("narx 1 250 000");
    expect(maskContacts("")).toBe("");
  });
  it("an e-mail address is not a handle", () => {
    expect(maskContacts("ali@mail.uz")).toBe("ali@mail.uz");
  });
});

describe("isAllowedName", () => {
  it("takes exactly the backend's 21 extensions, any case", () => {
    const all = ["pdf", "doc", "docx", "xls", "xlsx", "odt", "rtf", "txt", "jpg", "jpeg", "png", "heic", "webp", "mp3", "m4a", "ogg", "wav", "webm", "mp4", "mov", "zip"];
    for (const e of all) expect(isAllowedName(`file.${e}`)).toBe(true);
    for (const n of ["contract.PDF", "Scan.JPEG", "IMG_0001.HEIC", "photo.exe.png"]) expect(isAllowedName(n)).toBe(true);
  });
  it("refuses everything else: executables, and types the server answers with 415", () => {
    for (const n of ["a.exe", "A.EXE", "run.sh", "x.apk", "m.js", "s.php", "t.py", "d.dmg"]) expect(isAllowedName(n)).toBe(false);
    for (const n of ["anim.gif", "deck.pptx", "table.csv", "photo.heif", "a.rar", "a.7z", "archive.tar.gz", "pic.bmp", "noext", ".pdf"]) expect(isAllowedName(n)).toBe(false);
  });
  it("the picker filter says the same", () => {
    for (const n of ["a.pdf", "b.MOV", "c.zip"]) expect(CHAT_EXTS.test(n)).toBe(true);
    for (const n of ["a.gif", "b.pptx", "c.pdf.exe", "noext"]) expect(CHAT_EXTS.test(n)).toBe(false);
  });
  it("lists the allowed types for people, JPEG folded into JPG", () => {
    expect(ALLOWED_LIST).toBe("PDF, DOC, DOCX, XLS, XLSX, ODT, RTF, TXT, JPG, PNG, HEIC, WEBP, MP3, M4A, OGG, WAV, WEBM, MP4, MOV, ZIP");
  });
});

describe("size limits", () => {
  it("50 MB for every type, 200 MB for MP4 and MOV only", () => {
    expect([MAX_MB, VIDEO_MAX_MB]).toEqual([50, 200]);
    expect(maxMbFor("pdf")).toBe(50);
    expect(maxMbFor("webm")).toBe(50); // a video, but on the regular limit
    expect(maxMbFor("mp4")).toBe(200);
    expect(maxMbFor("mov")).toBe(200);
  });
});

describe("sentExt", () => {
  it("is the extension of the file on disk, which the upload sends", () => {
    expect(sentExt({ uri: "file:///cache/ImagePicker/9C0D-11.jpg", name: "IMG_0001.HEIC" })).toBe("jpg");
    expect(sentExt({ uri: "file:///cache/DocumentPicker/AB12.PDF", name: "Shartnoma.pdf" })).toBe("pdf");
    expect(sentExt({ uri: "file:///cache/Scan%202026.docx", name: "Scan 2026.docx" })).toBe("docx");
  });
  it("a content:// uri is sent under its display name, the picked one", () => {
    expect(sentExt({ uri: "content://media/external/images/media/1234", name: "IMG_2.heic" })).toBe("heic");
    expect(sentExt({ uri: "content://com.android.providers.downloads", name: "act.pdf" })).toBe("pdf");
  });
  it("falls back to the picked name when the file on disk has no extension", () => {
    expect(sentExt({ uri: "file:///cache/DocumentPicker/AB12.", name: "README" })).toBe("");
    expect(sentExt({ uri: "file:///cache/AB12", name: "act.pdf" })).toBe("pdf");
  });
});

describe("screenFiles", () => {
  const MB = 1024 * 1024;
  const f = (name: string, size: number, uri = `file:///cache/${name}`) => ({ uri, name, mime: "", size });
  it("keeps the files the server takes and names the others by reason", () => {
    const pdf = f("a.pdf", 50 * MB);
    const big = f("b.pdf", 50 * MB + 1);
    const video = f("c.mp4", 199 * MB);
    const bigVideo = f("d.mov", 201 * MB);
    const webm = f("e.webm", 60 * MB);
    const gif = f("f.gif", 10);
    const unknown = f("g.docx", 0); // the picker did not say: the server decides
    const r = screenFiles([pdf, big, video, bigVideo, webm, gif, unknown]);
    expect(r.ok).toEqual([pdf, video, unknown]);
    expect(r.tooBig).toEqual([big, bigVideo, webm]);
    expect(r.badType).toEqual([gif]);
  });
  it("judges a gallery photo by what is sent, not by its original name", () => {
    const converted = f("IMG_0001.HEIF", 3 * MB, "file:///cache/ImagePicker/X.jpeg");
    const gif = f("IMG_0002.GIF", 3 * MB, "file:///cache/ImagePicker/Y.gif");
    expect(screenFiles([converted, gif])).toEqual({ ok: [converted], badType: [gif], tooBig: [] });
  });
});

describe("fmtSize", () => {
  it("B / KB / MB, blank for zero", () => {
    expect(fmtSize(0)).toBe("");
    expect(fmtSize(512)).toBe("512 B");
    expect(fmtSize(2048)).toBe("2 KB");
    expect(fmtSize(5 * 1024 * 1024 + 300_000)).toBe("5.3 MB");
  });
});

describe("listStamp", () => {
  const t = (k: string) => k;
  it("time for today, 'yesterday' for yesterday, a date for older, blank for junk", () => {
    const now = new Date();
    expect(listStamp(now.toISOString(), t, "uz")).toMatch(/^\d{2}:\d{2}$/);
    expect(listStamp(new Date(now.getTime() - 86_400_000).toISOString(), t, "uz")).toBe("ms1.yesterday");
    expect(listStamp("2020-01-02T10:00:00Z", t, "uz")).not.toMatch(/^\d{2}:\d{2}$/);
    expect(listStamp("", t, "uz")).toBe("");
    expect(listStamp("nope", t, "uz")).toBe("");
  });
});
