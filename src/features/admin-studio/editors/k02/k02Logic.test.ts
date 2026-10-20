import { newRow, normRow, pruneOverrides, showCatalog, showSource, validateK02 } from "./k02Logic";

describe("K02 form rules", () => {
  it("removing a factor removes its override", () => {
    const p = pruneOverrides({ price_factor_ids: ["a"], price_factor_overrides: { a: { adjustment_type: "fixed", value: 1 }, b: { adjustment_type: "percent", value: 5 } } });
    expect(Object.keys(p.price_factor_overrides as object)).toEqual(["a"]);
  });
  it("a percent override above 100 and a negative value are blocked", () => {
    expect(validateK02({ price_factor_overrides: { a: { adjustment_type: "percent", value: 101 } } })["price_factor_overrides.a.value"]).toBe("@max100");
    expect(validateK02({ price_factor_overrides: { a: { adjustment_type: "fixed", value: -1 } } })["price_factor_overrides.a.value"]).toBe("@nonneg");
    expect(validateK02({ price_factor_overrides: { a: { adjustment_type: "fixed", value: 75000 } } })).toEqual({});
  });
  it("the checkbox cannot be removed from a row", () => {
    expect(normRow({ title: "x", verification_methods: ["comment"] }).verification_methods).toEqual(["checkbox", "comment"]);
    expect(validateK02({ completion_checklist: [{ title: "x", verification_methods: ["comment"] }] })["completion_checklist.0.verification_methods"]).toBe("@checkbox");
  });
  it("a proof can be required only when its method is chosen", () => {
    expect(normRow({ title: "x", verification_methods: ["checkbox"], image_required: true }).image_required).toBe(false);
    expect(validateK02({ completion_checklist: [{ title: "x", verification_methods: ["checkbox"], file_required: true }] })["completion_checklist.0.file_required"]).toBe("@methodOff");
    expect(normRow({ title: "x", verification_methods: ["checkbox", "file"], file_required: true }).file_required).toBe(true);
  });
  it("a new row has no id (the backend generates it) and an existing one keeps its id", () => {
    expect("id" in newRow()).toBe(false);
    expect(normRow({ id: "check_1", title: "x" }).id).toBe("check_1");
  });
  it("template fields follow the mode and the source", () => {
    expect(showSource({ template_mode: "not_required" })).toBe(false);
    expect(showCatalog({ template_mode: "required", template_source: "upload" })).toBe(false);
    expect(showCatalog({ template_mode: "optional", template_source: "catalog_or_upload" })).toBe(true);
  });
});
