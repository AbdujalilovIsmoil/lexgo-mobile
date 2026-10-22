import { boilerplate, categoryTone, fillMinutes } from "./labels";

describe("catalogue row helpers", () => {
  it("colours the four categories apart", () => {
    expect([categoryTone("legal-doc-civil"), categoryTone("legal-doc-economic"), categoryTone("legal-doc-administrative"), categoryTone("legal-doc-criminal"), categoryTone("other")]).toEqual(["accent", "ok", "warn", "err", "gray"]);
  });
  it("estimates the filling time from the fields: a third of a minute each, at least two, rounded to five past ten", () => {
    expect([fillMinutes(3), fillMinutes(20), fillMinutes(52), fillMinutes(100)]).toEqual([2, 6, 15, 30]);
  });
  it("finds the sentences many documents share", () => {
    const d = [...Array(7).fill("Shared sentence"), "Only here", ""];
    expect([...boilerplate(d)]).toEqual(["Shared sentence"]);
  });
});
