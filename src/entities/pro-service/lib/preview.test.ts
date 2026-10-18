import { previewService, profileStats } from "./preview";
import type { ProSeller } from "../model/types";

const seller: ProSeller = { name: "LexGo Yurist", avatarUrl: "", kind: "yurist", verified: true, rating: 0, reviews: 0, experienceYears: 0, cases: 0, successRate: 0, completed: null, about: { bio: "", district: "", languages: [], specializations: [], education: "", license: "", bar: "", organization: "" } };

describe("profile header tiles", () => {
  it("leaves unknown numbers empty and counts as 0", () => {
    const v = Object.fromEntries(profileStats(seller).map((x) => [x.key, x.value]));
    expect(v).toEqual({ rating: null, reviews: "0", experience: null, cases: null, success: null, completed: "0" });
  });
  it("formats known numbers", () => {
    const v = Object.fromEntries(profileStats({ ...seller, rating: 4.86, reviews: 12, experienceYears: 7, cases: 40, successRate: 92, completed: 31 }).map((x) => [x.key, x.value]));
    expect(v).toEqual({ rating: "4.9", reviews: "12", experience: "7", cases: "40", success: "92%", completed: "31" });
  });
});

describe("preview of the edited service", () => {
  it("is empty until a service is picked", () => expect(previewService(null, 0)).toEqual({ name: "", category: "", price: 0, filled: false }));
  it("typed price wins over the catalogue price", () => {
    const p = { name: "Divorce", category: "Family", catalogPrice: 100 };
    expect(previewService(p, 0).price).toBe(100);
    expect(previewService(p, 80).price).toBe(80);
  });
});
