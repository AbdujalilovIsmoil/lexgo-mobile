import { normalizeSearchText } from "./searchText";

describe("normalizeSearchText", () => {
  it("maps Cyrillic to Latin so both scripts match", () => {
    expect(normalizeSearchText("Никоҳ шартномаси")).toBe(normalizeSearchText("Nikoh shartnomasi"));
    expect(normalizeSearchText("Қонун")).toBe("qonun");
  });
  it("drops apostrophes and punctuation", () => {
    expect(normalizeSearchText("O'zbekiston, Respublikasi!")).toBe("ozbekiston respublikasi");
    expect(normalizeSearchText("G‘ayrat ʻAli")).toBe("gayrat ali");
  });
  it("is case-insensitive and trims", () => {
    expect(normalizeSearchText("  ABC  def ")).toBe("abc def");
    expect(normalizeSearchText("")).toBe("");
  });
});
