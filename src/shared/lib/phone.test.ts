import { formatAnyPhone, formatUzPhone, isUzPhone, maskPhone, normPhone, normUzPhone, splitPhone } from "./phone";

describe("normUzPhone", () => {
  it("accepts every common way of writing a number", () => {
    for (const raw of ["+998 90 123 45 67", "998901234567", "901234567", "+998901234567", " 90-123-45-67 "]) expect(normUzPhone(raw)).toBe("+998901234567");
  });
  it("rejects short / long / empty input", () => {
    for (const raw of ["", "12345", "+99890123", "90123456789012"]) expect(normUzPhone(raw)).toBe("");
    expect(isUzPhone("901234567")).toBe(true);
    expect(isUzPhone("9012")).toBe(false);
  });
  it("does not cut a local number that merely starts with 998", () => {
    expect(normUzPhone("998123456")).toBe("+998998123456");
  });
});

describe("formatUzPhone", () => {
  it("builds the mask as the user types", () => {
    expect(formatUzPhone("")).toBe("+998 ");
    expect(formatUzPhone("9")).toBe("+998 9");
    expect(formatUzPhone("90123")).toBe("+998 90 123");
    expect(formatUzPhone("901234567")).toBe("+998 90 123 45 67");
    expect(formatUzPhone("+998 90 123 45 67 99")).toBe("+998 90 123 45 67");
  });
});

describe("maskPhone", () => {
  it("hides the middle", () => {
    expect(maskPhone("+998901234567")).toBe("+998901 *** 67");
    expect(maskPhone("abc")).toBe("abc");
  });
});


describe("international numbers", () => {
  it("reads the country from the dial code and formats the rest in its grouping", () => {
    expect(splitPhone("+7 912 345").country.code).toBe("RU");
    expect(splitPhone("+998901234567").country.code).toBe("UZ");
    expect(splitPhone("+996555123456").country.code).toBe("KG");
    expect(formatAnyPhone("+998901234567")).toBe("+998 90 123 45 67");
    expect(formatAnyPhone("+79123456789")).toBe("+7 912 345 67 89");
    expect(formatAnyPhone("+996555123456")).toBe("+996 555 123 456");
  });
  it("a number with no plus is an Uzbek local one", () => {
    expect(formatAnyPhone("901234567")).toBe("+998 90 123 45 67");
    expect(normPhone("90 123 45 67")).toBe("+998901234567");
  });
  it("normPhone: complete numbers only, per country", () => {
    expect(normPhone("+998 90 123 45")).toBe("");
    expect(normPhone("+7 912 345 67 89")).toBe("+79123456789");
    expect(normPhone("+1 202 555 0123")).toBe("+12025550123");
    expect(normPhone("+7 912")).toBe("");
    expect(normPhone("+49 30 1234567890123")).toBe("");
  });
  it("an empty field is just the default prefix", () => {
    expect(formatAnyPhone("")).toBe("+998 ");
    expect(formatAnyPhone("+7")).toBe("+7 ");
  });
});
