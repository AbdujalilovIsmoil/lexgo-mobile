import { fmtCompact, fmtMoney } from "./money";

describe("fmtMoney", () => {
  it("groups thousands with spaces", () => {
    expect(fmtMoney(1250000)).toBe("1 250 000");
    expect(fmtMoney("99000")).toBe("99 000");
    expect(fmtMoney(999)).toBe("999");
    expect(fmtMoney(0)).toBe("0");
  });
  it("rounds and survives garbage", () => {
    expect(fmtMoney(1234.6)).toBe("1 235");
    expect(fmtMoney(undefined)).toBe("—");
    expect(fmtMoney(null)).toBe("—");
    expect(fmtMoney("abc")).toBe("—");
    expect(fmtMoney(NaN)).toBe("—");
    expect(fmtMoney(Infinity)).toBe("—");
  });
  it("keeps the sign of a refund", () => {
    expect(fmtMoney(-1250000)).toBe("-1 250 000");
  });
});

describe("fmtCompact", () => {
  it("shortens thousands and millions", () => {
    expect(fmtCompact(999)).toBe("999");
    expect(fmtCompact(1000)).toBe("1K");
    expect(fmtCompact(1500)).toBe("1.5K");
    expect(fmtCompact(2_000_000)).toBe("2M");
    expect(fmtCompact(2_450_000)).toBe("2.5M");
  });
});
