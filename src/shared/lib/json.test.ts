import { asArr, asDict, asNum, asStr, listFrom, uzs } from "./json";

describe("tolerant readers", () => {
  it("asDict only accepts plain objects", () => {
    expect(asDict({ a: 1 })).toEqual({ a: 1 });
    expect(asDict([1])).toEqual({});
    expect(asDict(null)).toEqual({});
    expect(asDict("x")).toEqual({});
  });
  it("asArr / asStr / asNum fall back", () => {
    expect(asArr([1])).toEqual([1]);
    expect(asArr({})).toEqual([]);
    expect(asStr(5)).toBe("5");
    expect(asStr(null, "z")).toBe("z");
    expect(asNum("12.5")).toBe(12.5);
    expect(asNum("x", 7)).toBe(7);
    expect(asNum(Infinity, 3)).toBe(3);
    expect(asNum(undefined)).toBe(0);
  });
});

describe("listFrom", () => {
  it("takes a bare array, the first matching key, or []", () => {
    expect(listFrom([1, 2])).toEqual([1, 2]);
    expect(listFrom({ items: [1], data: [2] }, "data", "items")).toEqual([2]);
    expect(listFrom({ data: "no" }, "data")).toEqual([]);
    expect(listFrom(null, "data")).toEqual([]);
  });
});

describe("uzs", () => {
  it("returns the first numeric key, even as a string", () => {
    expect(uzs({ amount: "5000" }, "price", "amount")).toBe(5000);
    expect(uzs({ price: 0, amount: 9 }, "price", "amount")).toBe(0);
    expect(uzs({}, "price")).toBe(0);
  });
});
