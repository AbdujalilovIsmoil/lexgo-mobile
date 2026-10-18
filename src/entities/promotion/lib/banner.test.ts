import { bannerBlock, isBannerUrl } from "./banner";
import type { BannerCheck } from "../model/types";

const base = { required: false, accepts: true, url: "", fileUrl: "", check: null, uploading: false };
const check = (status: BannerCheck["status"]): BannerCheck => ({ fileUrl: "f", status, reasons: [], suggestions: [] });

describe("isBannerUrl", () => {
  it("wants https with a dotted host", () => {
    expect(isBannerUrl("https://cdn.example.uz/a.jpg")).toBe(true);
    expect(isBannerUrl("http://cdn.example.uz/a.jpg")).toBe(false);
    expect(isBannerUrl("https://localhost")).toBe(false);
    expect(isBannerUrl("https://a b.uz")).toBe(false);
  });
});

describe("bannerBlock", () => {
  it("lets an optional banner stay empty, and ignores a placement without banner", () => {
    expect(bannerBlock(base)).toBeNull();
    expect(bannerBlock({ ...base, accepts: false, required: true })).toBeNull();
  });
  it("asks for a picture when the package requires one", () => {
    expect(bannerBlock({ ...base, required: true })).toBe("needed");
    expect(bannerBlock({ ...base, required: true, url: "https://a.uz/x.jpg" })).toBeNull();
  });
  it("waits for the upload and demands a passed check", () => {
    expect(bannerBlock({ ...base, uploading: true })).toBe("uploading");
    expect(bannerBlock({ ...base, fileUrl: "f", check: check("manual_review") })).toBe("review");
    expect(bannerBlock({ ...base, fileUrl: "f", check: check("rejected") })).toBe("review");
    expect(bannerBlock({ ...base, fileUrl: "f", check: check("active") })).toBeNull();
  });
  it("rejects a bad link", () => expect(bannerBlock({ ...base, url: "ftp://x" })).toBe("badUrl"));
});
