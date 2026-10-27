import { codeFrom, isBulkInsert, lxCodeFrom, secretFrom } from "./pasted";

describe("codeFrom", () => {
  it("takes a bare or grouped code", () => {
    expect(codeFrom("123456", 6)).toBe("123456");
    expect(codeFrom("123 456", 6)).toBe("123456");
    expect(codeFrom("123-456", 6)).toBe("123456");
  });
  it("finds the code inside the message it was copied from", () => {
    expect(codeFrom("LexGo: tasdiqlash kodi 482 913. Uni hech kimga bermang", 6)).toBe("482913");
    expect(codeFrom("Kod: 482913\nMuddati 5 daqiqa", 6)).toBe("482913");
    expect(codeFrom("‎482913‏", 6)).toBe("482913");
  });
  it("falls back to the digits in order while typing", () => {
    expect(codeFrom("48", 6)).toBe("48");
    expect(codeFrom("4829131", 6)).toBe("482913");
  });
});

describe("lxCodeFrom", () => {
  it("finds a gift or referral code inside a copied message", () => {
    expect(lxCodeFrom("Taklif kodim: LXLGA4791716 — LexGo'da ro'yxatdan o'ting")).toBe("LXLGA4791716");
    expect(lxCodeFrom("Sovg'a kodi: lx-12345678")).toBe("LX-12345678");
  });
  it("keeps what is being typed", () => {
    expect(lxCodeFrom("lx")).toBe("LX");
    expect(lxCodeFrom("lxa b")).toBe("LXAB");
  });
});

describe("secretFrom", () => {
  it("drops the line break, spaces and invisible marks a copied password brings", () => {
    expect(secretFrom("  Parol123!\n")).toBe("Parol123!");
    expect(secretFrom("​Parol 123﻿")).toBe("Parol 123");
  });
});

describe("isBulkInsert", () => {
  it("tells a paste from a keystroke", () => {
    expect(isBulkInsert("abc", "abcd")).toBe(false);
    expect(isBulkInsert("", "Parol123")).toBe(true);
  });
});
