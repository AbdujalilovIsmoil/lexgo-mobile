import { fmtSize } from "./fmtSize";
import { isAllowedName } from "./fileRules";
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
  it("refuses executables and scripts, any case", () => {
    for (const n of ["a.exe", "A.EXE", "run.sh", "x.apk", "m.js", "s.php", "t.py", "d.dmg"]) expect(isAllowedName(n)).toBe(false);
  });
  it("accepts documents and images", () => {
    for (const n of ["contract.pdf", "scan.jpeg", "a.docx", "archive.tar.gz", "noext", "photo.exe.png"]) expect(isAllowedName(n)).toBe(true);
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
