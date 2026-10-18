import { normField } from "@/entities/admin-studio/lib/normField";
import { checkFields, defaultRow } from "./nested";

const comps = normField({ key: "components", type: "list", item_schema: { type: "object", properties: [{ key: "service_id", type: "select", required: true }, { key: "kind", type: "select", default: "mandatory" }, { key: "quantity", type: "number", default: 1, min: 1 }] } });

describe("nested schema", () => {
  it("seeds new rows with schema defaults", () => expect(defaultRow(comps.item?.props ?? [])).toEqual({ kind: "mandatory", quantity: 1 }));
  it("checks required and min inside rows", () => {
    const e = checkFields([comps], { components: [{ kind: "mandatory", quantity: 0 }] }, "", {});
    expect(e).toEqual({ "components.0.service_id": "@required", "components.0.quantity": "@min" });
  });
  it("skips context-managed fields", () => expect(checkFields([normField({ key: "service_id", required: true, context_managed: true })], {}, "", {})).toEqual({}));
});
