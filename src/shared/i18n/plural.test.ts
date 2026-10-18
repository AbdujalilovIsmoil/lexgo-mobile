import { applyPlural, pluralCategory } from "./plural";
import { translate } from "./useT";

describe("pluralCategory", () => {
  it("russian one / few / many", () => {
    expect([1, 21, 101].map((n) => pluralCategory("ru", n))).toEqual(["one", "one", "one"]);
    expect([2, 3, 4, 22, 104].map((n) => pluralCategory("ru", n))).toEqual(["few", "few", "few", "few", "few"]);
    expect([0, 5, 11, 12, 14, 20, 111].map((n) => pluralCategory("ru", n))).toEqual(Array(7).fill("many"));
  });
  it("english one / other, uzbek always other", () => {
    expect([pluralCategory("en", 1), pluralCategory("en", 2), pluralCategory("en", 0)]).toEqual(["one", "other", "other"]);
    expect(pluralCategory("uz", 1)).toBe("other");
  });
});

describe("applyPlural", () => {
  const ru = "{n, plural, one {# страница} few {# страницы} other {# страниц}}";
  it("picks the branch and fills #", () => {
    expect(applyPlural(ru, { n: 1 }, "ru")).toBe("1 страница");
    expect(applyPlural(ru, { n: 3 }, "ru")).toBe("3 страницы");
    expect(applyPlural(ru, { n: 7 }, "ru")).toBe("7 страниц");
  });
  it("keeps surrounding text and handles two blocks", () => {
    expect(applyPlural("Тема: {min, plural, one {# символ} other {# символов}}.", { min: 5 }, "ru")).toBe("Тема: 5 символов.");
    expect(applyPlural("{a, plural, one {# x} other {# xs}} / {b, plural, one {# y} other {# ys}}", { a: 1, b: 2 }, "en")).toBe("1 x / 2 ys");
  });
  it("leaves plain text alone", () => {
    expect(applyPlural("{n} sahifa", { n: 2 }, "uz")).toBe("{n} sahifa");
  });
});

describe("translate", () => {
  it("renders plural keys in ru/en and plain keys in uz", () => {
    expect(translate("ru", "cxDa.pagesN", { n: 2 })).toBe("2 страницы");
    expect(translate("en", "cxDa.pagesN", { n: 1 })).toBe("1 page");
    expect(translate("uz", "cxDa.pagesN", { n: 4 })).toBe("4 sahifa");
  });
});
