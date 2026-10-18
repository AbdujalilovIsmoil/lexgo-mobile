import { matchTemplates } from "./match";

const rows = [{ id: "1", name: "Mehnat shartnomasi", category: "labor", language: "uz" }, { id: "2", name: "Ijara shartnomasi", category: "civil", language: "uz" }];
it("filters by name or category, ignoring case", () => {
  expect(matchTemplates(rows, "  IJARA ").map((r) => r.id)).toEqual(["2"]);
  expect(matchTemplates(rows, "labor").map((r) => r.id)).toEqual(["1"]);
  expect(matchTemplates(rows, "")).toHaveLength(2);
  expect(matchTemplates(rows, "zzz")).toEqual([]);
});
