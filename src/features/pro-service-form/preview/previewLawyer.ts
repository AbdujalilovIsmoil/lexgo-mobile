import type { Lawyer, LawyerService } from "@/entities/lawyer";
import type { ProSeller, ProService } from "@/entities/pro-service";

export type Boost = { profile: boolean; services: ReadonlySet<string> }; // what is running: the profile in the TOP, boosted services
export type Draft = { id: string; title: string; category: string; price: number; catalogPrice: number; note: string };

const toService = (x: ProService, boost: Boost): LawyerService => ({ id: x.id, title: x.name, price: x.effectivePrice || x.catalogPrice, basePrice: x.catalogPrice, category: [x.categoryTitle, x.subcategory].filter(Boolean).join(" · "), categoryId: "", deliveryMinutes: 0, note: x.note, sponsored: !!x.promotion || boost.services.has(x.id) });

// The seller as a `Lawyer` (the shape the client screens read): the services clients can see today (active ones in the catalogue,
// except the one being edited) plus the service of the form, first. Unknown numbers stay 0 and render as "—".
export function previewLawyer(seller: ProSeller, sellerId: string, region: string, items: ProService[], draft: Draft, editing: boolean, boost: Boost = { profile: false, services: new Set() }): Lawyer {
  const others = items.filter((x) => x.status === "active" && x.catalogActive && !(editing && x.id === draft.id)).map((x) => toService(x, boost));
  const mine: LawyerService = { id: draft.id, title: draft.title, price: draft.price, basePrice: draft.catalogPrice, category: draft.category, categoryId: "", deliveryMinutes: 0, note: draft.note.trim(), sponsored: boost.services.has(draft.id) };
  const services = [mine, ...others];
  const priced = services.map((x) => x.price).filter((n) => n > 0);
  const a = seller.about;
  return {
    id: sellerId, userId: sellerId, publicId: "", name: seller.name, region, district: a.district || undefined, specializations: a.specializations, languages: a.languages,
    experienceYears: seller.experienceYears, rating: seller.rating, reviews: seller.reviews, rated: seller.reviews > 0 && seller.rating > 0,
    basePrice: priced.length ? Math.min(...priced) : 0, priceTo: priced.length ? Math.max(...priced) : 0, bio: a.bio || undefined, verified: seller.verified, badge: "",
    kind: seller.kind === "advokat" ? "advocate" : "lawyer", totalCases: seller.cases, winsCount: 0, partialWins: 0, successRate: seller.successRate, completed: seller.completed ?? 0,
    education: a.education || undefined, licenseNumber: a.license || undefined, barAssociation: a.bar || undefined, organizationName: a.organization || undefined,
    createdAt: "", isNew: false, promoted: boost.profile, boost: boost.profile ? 1 : 0, available: true, services, reviewList: [],
  };
}
