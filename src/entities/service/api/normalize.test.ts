import { normCategory, normService } from "./normalize";

describe("normService", () => {
  it("falls back to title when the translated title is an empty string (the passport sends '')", () => {
    expect(normService({ id: "1", title: "Ota-ona huquqi", title_uz_latn: "", title_ru: "" }).name).toBe("Ota-ona huquqi");
  });
  it("prefers the translation of the locale when there is one", () => {
    expect(normService({ id: "1", title: "A", title_ru: "Б" }, "ru").name).toBe("Б");
    expect(normService({ id: "1", title: "A", title_uz_latn: "Aa" }, "uz").name).toBe("Aa");
  });
  it("reads price, template, advocate flag and drops a zero price", () => {
    expect(normService({ id: "1", title: "A", standard_price: 900000, document_template_id: "t", advokat_required: true, category_id: "c", category_title: "Oila" })).toMatchObject({ price: 900000, documentTemplateId: "t", advokatRequired: true, categoryId: "c", categoryTitle: "Oila" });
    expect(normService({ id: "1", title: "A", base_price: 0 }).price).toBeUndefined();
    expect(normService({ id: "1", title: "A", pricing_tier: "free" }).free).toBe(true);
    expect(normService(null)).toMatchObject({ id: "", name: "", isActive: true });
  });
});

describe("normCategory", () => {
  it("reads sub-directions with their sample services", () => {
    const c = normCategory({ id: "c", title: "Oila", services_count: 3, subcategories: [{ title: "Nikoh", services_count: 2, sample_services: [{ title: "A.docx" }, { title: "B" }] }, { title: "" }] });
    expect(c).toMatchObject({ id: "c", name: "Oila", servicesCount: 3, subcategoriesCount: 1 });
    expect(c.subcategories[0]).toEqual({ title: "Nikoh", servicesCount: 2, samples: ["A", "B"] });
  });
});
