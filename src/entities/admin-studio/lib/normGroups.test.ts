import { dashRows } from "./dashRows";
import { normGroups } from "./normGroups";

const ctor = (code: string, step: number) => ({ code, title: code, navigation: { group_key: "g", step_number: step, step_count: 2 }, completed: step === 1 });
const raw = {
  groups: [
    { key: "services_packages", title: "Zeta", order: 1, constructors: [ctor("K01", 1), ctor("K02", 2)] },
    { key: "advertising", title: "Alpha", order: 10, constructors: [ctor("MP04", 1)] },
    { key: "documents_texts", title: "Beta", order: 2, constructors: [] },
  ],
};

describe("normGroups", () => {
  it("keeps the server order, never alphabetical", () => {
    expect(normGroups(raw).map((g) => g.key)).toEqual(["services_packages", "documents_texts", "advertising"]);
  });
  it("keeps the constructor sequence inside a group", () => {
    expect(normGroups(raw)[0].items.map((c) => c.code)).toEqual(["K01", "K02"]);
  });
  it("reads the dependency state", () => {
    const c = normGroups(raw)[0].items[0];
    expect(c.nav).toMatchObject({ step: 1, steps: 2, completed: true, group: "g" });
  });
  it("dashRows drops empty groups and filters by group", () => {
    const g = normGroups(raw);
    expect(dashRows(g, () => true).map((r) => (r.type === "group" ? r.group.key : r.item.code))).toEqual(["services_packages", "K01", "K02", "advertising", "MP04"]);
    expect(dashRows(g, () => true, "advertising")).toHaveLength(2);
    expect(dashRows(g, (c) => c.code === "K02")).toHaveLength(2);
  });
});
