import { canFinish, doneLabel, firstName, isPicked, removeId, subtitleOf, toggle } from "./selection";
import type { Person } from "../model/usePeople";

const p = (id: string, name = "", phone = ""): Person => ({ id, name, phone, lexgoId: "", role: "client" });

describe("selection", () => {
  it("toggle appends and removes without moving the others", () => {
    const a = p("a"), b = p("b"), c = p("c");
    const l1 = toggle([a, b], c);
    expect(l1.map((x) => x.id)).toEqual(["a", "b", "c"]);
    expect(toggle(l1, a).map((x) => x.id)).toEqual(["b", "c"]);
    expect(isPicked(l1, "b")).toBe(true);
    expect(removeId(l1, "b").map((x) => x.id)).toEqual(["a", "c"]);
  });
  it("firstName falls back to phone, then ?", () => {
    expect(firstName(p("a", "  Ali Valiyev "))).toBe("Ali");
    expect(firstName(p("a", "", "+998901112233"))).toBe("+998901112233");
    expect(firstName(p("a"))).toBe("?");
  });
  it("subtitle prefers the phone, else role and id", () => {
    expect(subtitleOf({ ...p("a", "x", "+998"), lexgoId: "L1" }, "Lawyer")).toBe("+998");
    expect(subtitleOf({ ...p("a", "x"), lexgoId: "L1" }, "Lawyer")).toBe("Lawyer · L1");
    expect(subtitleOf(p("a", "x"), "")).toBe("");
  });
  it("done label and the minimum", () => {
    expect(doneLabel(0, "Done", (n) => `Done · ${n}`)).toBe("Done");
    expect(doneLabel(3, "Done", (n) => `Done · ${n}`)).toBe("Done · 3");
    expect(canFinish(0, 1)).toBe(false);
    expect(canFinish(1, 1)).toBe(true);
    expect(canFinish(0, 0)).toBe(true);
  });
});
