import { inviteKind, inviteTitle, ladderOf, maskContact, maskName, monogram, shareMessage } from "./growth";
import { growWindow, nextCount, PAGE } from "@/shared/lib/pageWindow";

const inv = (name: string, phone: string) => ({ name, phone, status: "invited", reward: 0, joinedAt: "" });

describe("ladderOf", () => {
  it("starts at the base level", () => {
    const l = ladderOf(0);
    expect(l.pct).toBe(18);
    expect(l.left).toBe(5);
    expect(l.progress).toBe(0);
    expect(l.steps.map((s) => s.state)).toEqual(["current", "next", "locked", "locked"]);
  });
  it("progresses inside a segment", () => {
    const l = ladderOf(7);
    expect(l.pct).toBe(16);
    expect(l.left).toBe(3);
    expect(l.progress).toBeCloseTo(0.4);
    expect(l.steps.map((s) => s.state)).toEqual(["done", "current", "next", "locked"]);
  });
  it("unlocks a level exactly at the threshold", () => {
    expect(ladderOf(5).pct).toBe(16);
    expect(ladderOf(20).pct).toBe(13);
  });
  it("tops out", () => {
    const l = ladderOf(35);
    expect(l.next).toBeNull();
    expect(l.left).toBe(0);
    expect(l.progress).toBe(1);
  });
  it("ignores garbage", () => {
    expect(ladderOf(-3).pct).toBe(18);
    expect(ladderOf(NaN).pct).toBe(18);
  });
});

describe("masking", () => {
  it("masks names", () => {
    expect(maskName("Ali Valiyev")).toBe("Ali V.");
    expect(maskName("Ali")).toBe("Ali");
    expect(maskName("  ")).toBe("");
  });
  it("masks phones", () => {
    expect(maskContact("+998901234567")).toBe("+99890 *** 67");
    expect(maskContact("abc@x.uz")).toBe("abc***uz");
    expect(maskContact("")).toBe("");
  });
  it("titles and monograms", () => {
    expect(inviteTitle(inv("Ali Valiyev", "+998901234567"))).toBe("Ali V.");
    expect(inviteTitle(inv("", "+998901234567"))).toBe("+99890 *** 67");
    expect(monogram(inv("ali", ""))).toBe("A");
    expect(monogram(inv("", ""))).toBe("?");
  });
});

describe("statuses and paging", () => {
  it("maps statuses", () => {
    expect(inviteKind("joined")).toBe("active");
    expect(inviteKind("REWARDED")).toBe("active");
    expect(inviteKind("registered")).toBe("registered");
    expect(inviteKind("invited")).toBe("pending");
    expect(inviteKind("")).toBe("pending");
  });
  it("pages ten at a time", () => {
    expect(growWindow(PAGE, 25)).toBe(20);
    expect(growWindow(20, 25)).toBe(25);
    expect(nextCount(20, 25)).toBe(5);
  });
  it("builds the share message", () => {
    expect(shareMessage("Hi", "ABC", "https://x/y")).toBe("Hi https://x/y\nABC");
    expect(shareMessage("Hi", "ABC", "")).toBe("Hi ABC");
  });
});
