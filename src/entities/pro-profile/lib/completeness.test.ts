import { completeness, sectionsOf } from "./completeness";
import type { ProProfile } from "../model/types";

const p = (o: Partial<ProProfile>): ProProfile =>
  ({ userId: "u", publicId: "", name: "", sellerType: "yurist", region: "", district: "", licenseNumber: "", barAssociation: "", advocateStructure: "", organizationName: "", experienceYears: 0, lawyerExperienceYears: 0, specializations: [], languages: [], bio: "", education: "", totalCases: 0, winsCount: 0, partialWinsCount: 0, successRate: 0, hourlyPrice: 0, verificationStatus: "", verified: false, badgeLabel: "", rating: 0, reviewsCount: 0, onlineNow: false, available: true, serviceTitles: [], priceFrom: 0, priceTo: 0, ...o }) as ProProfile;

const full = { name: "Ali", sellerType: "advokat", region: "tashkent", licenseNumber: "A-1", barAssociation: "Toshkent", advocateStructure: "byuro", experienceYears: 5, specializations: ["civil"], languages: ["uz"], bio: "b", education: "TDYU" };
const account = { name: "Ali", email: "a@b.uz", avatarUrl: "https://x/a.jpg" };

describe("profile completeness", () => {
  it("a yurist has six parts (no organisation part), an advokat seven", () => {
    expect(sectionsOf(p({}), account).map((s) => s.key)).toEqual(["personal", "photo", "kind", "license", "experience", "region"]);
    expect(sectionsOf(p({ sellerType: "advokat" }), account).map((s) => s.key)).toContain("organization");
  });
  it("counts the photo the marketplace card shows", () => {
    const noPhoto = sectionsOf(p(full), { ...account, avatarUrl: "" });
    expect(noPhoto.find((s) => s.key === "photo")).toMatchObject({ done: false, missing: ["photo"] });
    expect(completeness(noPhoto)).toBe(86); // 6 of 7
    expect(completeness(sectionsOf(p(full), account))).toBe(100);
  });
  it("takes the name from the profile while the account is not there yet; blank text is missing", () => {
    const s = sectionsOf(p({ name: "Ali", languages: ["uz"], bio: "  " }));
    expect(s.find((x) => x.key === "personal")?.missing).toEqual(["email"]);
    expect(s.find((x) => x.key === "experience")?.missing).toEqual(["experience", "directions", "bio"]);
  });
  it("an empty profile is 0 % only when every part is missing", () => {
    expect(completeness(sectionsOf(p({ sellerType: "" })))).toBe(0);
    expect(completeness([])).toBe(0);
  });
});
