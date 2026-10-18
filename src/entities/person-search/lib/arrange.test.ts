import { arrange, mergeRecent } from "./arrange";
import type { Person } from "../model/usePeople";

const p = (id: string): Person => ({ id, name: id, phone: "", lexgoId: "", role: "client" });

describe("arrange", () => {
  it("empty query: recent first, then the rest without duplicates", () => {
    const out = arrange([p("a"), p("b"), p("c")], [p("c"), p("me")], "", "me");
    expect(out.map((s) => [s.key, s.data.map((x) => x.id)])).toEqual([["recent", ["c"]], ["suggested", ["a", "b"]]]);
  });
  it("typed query: one results section, none when nothing found", () => {
    expect(arrange([p("a")], [p("c")], "al", "me")).toEqual([{ key: "results", data: [p("a")] }]);
    expect(arrange([], [p("c")], "al", "me")).toEqual([]);
  });
  it("does not depend on who is selected (rows stay put)", () => {
    const a = arrange([p("a"), p("b")], [], "", "me");
    expect(a[0].data.map((x) => x.id)).toEqual(["a", "b"]);
  });
  it("mergeRecent puts new picks first, dedupes and caps", () => {
    expect(mergeRecent([p("a"), p("b")], [p("b"), p("c")], 3).map((x) => x.id)).toEqual(["b", "c", "a"]);
    expect(mergeRecent([p("a"), p("b")], [p("c")], 2).map((x) => x.id)).toEqual(["c", "a"]);
  });
});
