export type ServiceStatus = "active" | "paused" | "inactive";
export const SERVICE_STATUSES: ServiceStatus[] = ["active", "paused", "inactive"];
export type ServiceFilter = "all" | ServiceStatus;

// Whose services: the signed-in seller, or (for an organization owner) one member.
// One price factor the server applied to the ceiling (region, experience, rating …).
export type Modifier = { code: string; key: string; label: string; percent: number | null; multiplier: number | null; amount: number | null };

// The server's allowed price corridor for one service of one seller.
export type PriceBand = { recommended: number; min: number; max: number; base: number | null; currency: string; modifiers: Modifier[] | null };

export type Promo = { id: string; serviceId: string; packageTitle: string; daysLeft: number; endsAt: string };

export type ProService = {
  id: string;
  name: string;
  categoryTitle: string;
  subcategory: string;
  catalogPrice: number; // 0 = the catalogue has no price
  catalogActive: boolean;
  advokatRequired: boolean;
  status: ServiceStatus;
  selectedPrice: number; // 0 = seller did not set one
  effectivePrice: number;
  priceCapped: boolean; // the server lowered the chosen price to the allowed maximum
  note: string;
  visible: boolean; // listed in the marketplace right now
  promotion: Promo | null; // boosts this service
  profileBoost: Promo | null; // boosts the whole profile
  limits: PriceBand | null;
  negotiationAllowed: boolean | null; // null = the list did not say
  rulesPending: boolean; // switched on, but held back until the seller accepts the service rules
};

// The seller as clients see them (profile header of the live preview): every number may be unknown.
export type ProSeller = {
  name: string;
  avatarUrl: string;
  kind: "yurist" | "advokat";
  verified: boolean;
  rating: number;
  reviews: number;
  experienceYears: number;
  cases: number;
  successRate: number; // 0..100
  completed: number | null; // null = the backend does not say
  about: SellerAbout; // the "Haqida" facts clients read on the profile
};

export type SellerAbout = { bio: string; district: string; languages: string[]; specializations: string[]; education: string; license: string; bar: string; organization: string };

export type ProServices = {
  seller: ProSeller;
  items: ProService[];
  sellerId: string;
  region: string;
  verified: boolean;
  verificationStatus: string;
  sellerType: string;
  accountStatus: string;
};

// negotiationAllowed / selectedRuleIds: the current marketplace choices, sent back so an edit keeps them (null = unknown, not sent).
export type ServiceInput = { serviceId: string; selectedPrice: number; note: string; status: ServiceStatus; negotiationAllowed: boolean | null; selectedRuleIds: string[] | null };
export const NOTE_MAX = 2000;
