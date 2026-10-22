import { categoryKey, matchTemplates, type DocTemplate } from "./match";

const t = (o: Partial<DocTemplate>): DocTemplate => ({ id: "1", name: "Ijara shartnomasi", category: "legal-doc-civil", language: "uz-cyrl", description: "Uy-joy ijarasi", fields: 12, sections: 2, price: 0, updatedAt: "", sourceFile: "", hasSource: true, ...o });

it("needs every word of the query, in any order, in the name, description or category", () => {
  const rows = [t({ id: "1" }), t({ id: "2", name: "Ariza", description: "Sudga ariza" }), t({ id: "3", name: "Jinoyat arizasi", category: "legal-doc-criminal" })];
  expect(matchTemplates(rows, "  ").length).toBe(3);
  expect(matchTemplates(rows, "shartnomasi ijara").map((x) => x.id)).toEqual(["1"]);
  expect(matchTemplates(rows, "sudga").map((x) => x.id)).toEqual(["2"]);
  expect(matchTemplates(rows, "criminal ariza").map((x) => x.id)).toEqual(["3"]);
});

it("maps a branch slug to its i18n key", () => {
  expect(categoryKey("legal-doc-civil")).toBe("tpl.cat.civil");
  expect(categoryKey("other")).toBe("");
});

it("a Latin query finds a Cyrillic title and the other way round", () => {
  const rows = [t({ id: "1", name: "Уй-жой олди-сотди шартномаси", description: "" }), t({ id: "2", name: "O'zbekiston Respublikasi fuqarosi", description: "" })];
  expect(matchTemplates(rows, "shartnoma").map((x) => x.id)).toEqual(["1"]);
  expect(matchTemplates(rows, "олди сотди").map((x) => x.id)).toEqual(["1"]);
  expect(matchTemplates(rows, "ўзбекистон").map((x) => x.id)).toEqual(["2"]);
  expect(matchTemplates(rows, "o‘zbekiston").map((x) => x.id)).toEqual(["2"]);
});
