import type { ProSeller, ProService } from "@/entities/pro-service";
import { previewLawyer } from "./previewLawyer";

const about = { bio: "Oilaviy nizolar", district: "", languages: ["uz-latn"], specializations: ["family"], education: "", license: "", bar: "", organization: "" };
const seller: ProSeller = { name: "LexGo Yurist", avatarUrl: "", kind: "yurist", verified: true, rating: 4.5, reviews: 10, experienceYears: 7, cases: 40, successRate: 90, completed: null, about };
const svc = (id: string, over: Partial<ProService> = {}): ProService => ({ id, name: `S${id}`, categoryTitle: "Oila", subcategory: "", catalogPrice: 100, catalogActive: true, advokatRequired: false, status: "active", selectedPrice: 0, effectivePrice: 150, note: "n", visible: true, promotion: null, profileBoost: null, limits: null, priceCapped: false, ...over } as ProService);
const draft = { id: "d", title: "Yangi", category: "Oila", price: 200, catalogPrice: 100, note: " izoh " };

it("puts the form's service first and keeps only the services clients can see", () => {
  const l = previewLawyer(seller, "u1", "Toshkent", [svc("1"), svc("2", { status: "paused" }), svc("3", { catalogActive: false })], draft, false);
  expect(l.services.map((x) => x.id)).toEqual(["d", "1"]);
  expect(l.services[0]).toMatchObject({ title: "Yangi", price: 200, note: "izoh" });
  expect(l.basePrice).toBe(150);
  expect(l.priceTo).toBe(200);
});

it("replaces the edited service instead of listing it twice and maps the seller's facts", () => {
  const l = previewLawyer(seller, "u1", "Toshkent", [svc("d"), svc("1")], draft, true);
  expect(l.services.map((x) => x.id)).toEqual(["d", "1"]);
  expect(l).toMatchObject({ name: "LexGo Yurist", kind: "lawyer", rated: true, completed: 0, totalCases: 40, bio: "Oilaviy nizolar", region: "Toshkent" });
});

it("does not invent a rating or a price for a new seller", () => {
  const l = previewLawyer({ ...seller, rating: 0, reviews: 0 }, "u1", "", [], { ...draft, price: 0, catalogPrice: 0 }, false);
  expect(l.rated).toBe(false);
  expect(l.basePrice).toBe(0);
});

it("shows the running boosts like clients see them", () => {
  const l = previewLawyer(seller, "u1", "", [svc("1")], draft, false, { profile: true, services: new Set(["1", "d"]) });
  expect(l.promoted).toBe(true);
  expect(l.services.map((x) => x.sponsored)).toEqual([true, true]);
});
