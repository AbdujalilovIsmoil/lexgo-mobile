import { normService } from "./normalize";

describe("seller service title", () => {
  it("skips an empty Latin title and uses the next one present", () => {
    expect(normService({ id: "s", title_uz_latn: "", title: "Test xizmat" }).name).toBe("Test xizmat");
    expect(normService({ id: "s", service: { title: "Ichki nom" } }).name).toBe("Ichki nom");
    expect(normService({ id: "s", title_uz_latn: "Lotin nomi", title: "Boshqa" }).name).toBe("Lotin nomi");
    expect(normService({ id: "s" }).name).toBe("");
  });
});
