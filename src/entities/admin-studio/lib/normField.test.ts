import { normField } from "./normField";

describe("normField", () => {
  it("reads nested list item schemas and context-managed fields", () => {
    const f = normField({ key: "sections", type: "list", min_items: 1, item_schema: { type: "object", properties: [{ key: "id", type: "text", required: true }, { key: "options", type: "list", item_schema: { type: "object", properties: [{ key: "value", type: "number", min: 0, required: true }] } }] } });
    expect(f.minItems).toBe(1);
    expect(f.item?.props?.map((p) => p.key)).toEqual(["id", "options"]);
    expect(f.item?.props?.[1].item?.props?.[0]).toMatchObject({ key: "value", min: 0, required: true });
    expect(normField({ key: "service_id", type: "select", context_managed: true, source: "/studio/reference/services" })).toMatchObject({ managed: true, source: "services" });
  });
  it("reads a scalar list item", () => {
    expect(normField({ key: "keywords", type: "list", item_schema: { key: "value", type: "text" } }).item?.type).toBe("text");
  });
});
