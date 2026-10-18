import { validateK29, withTarget } from "./k29Logic";

const opt = (id: string, value: unknown, adjustment_type = "fixed") => ({ id, label: id, adjustment_type, value });
const ok = { target_type: "service", service_id: "s1", title: "T", sections: [{ id: "loc", title: "Location", options: [opt("a", 100000), opt("urgent", 20, "percent")] }] };

describe("validateK29", () => {
  it("accepts the contract example", () => expect(validateK29(ok)).toEqual({}));
  it("needs the id of the chosen target", () => {
    expect(validateK29({ ...ok, service_id: "" })).toEqual({ service_id: "@required" });
    expect(validateK29({ ...ok, target_type: "package", package_id: "p" })).toEqual({});
  });
  it("rejects negative values and unknown adjustment types", () => {
    const e = validateK29({ ...ok, sections: [{ id: "x", title: "X", options: [opt("a", -1), opt("b", 5, "discount"), opt("c", "")] }] });
    expect(e).toMatchObject({ "sections.0.options.0.value": "@negative", "sections.0.options.1.adjustment_type": "@required", "sections.0.options.2.value": "@required" });
  });
  it("rejects duplicate option ids across sections", () => {
    const e = validateK29({ ...ok, sections: [{ id: "a", title: "A", options: [opt("same", 1)] }, { id: "b", title: "B", options: [opt("same", 2)] }] });
    expect(e["sections.0.options.0.id"]).toBe("@duplicate");
    expect(e["sections.1.options.0.id"]).toBe("@duplicate");
  });
  it("requires at least one section and keeps only the target's id on switch", () => {
    expect(validateK29({ ...ok, sections: [] }).sections).toBe("@minOne");
    expect(withTarget({ service_id: "s", package_id: "p" }, "package")).toEqual({ package_id: "p", target_type: "package" });
  });
});
