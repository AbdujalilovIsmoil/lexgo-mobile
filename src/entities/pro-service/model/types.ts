export type ServiceStatus = "active" | "paused" | "inactive";
export const SERVICE_STATUSES: ServiceStatus[] = ["active", "paused", "inactive"];

// Whose services: the signed-in seller, or (for an organization owner) one member.
export type ServiceScope = { kind: "me" } | { kind: "org"; orgId: string; memberId: string };

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
  note: string;
  visible: boolean; // listed in the marketplace right now
  promotion: Promo | null; // boosts this service
  profileBoost: Promo | null; // boosts the whole profile
  limits: PriceBand | null;
};

export type ProServices = {
  items: ProService[];
  sellerId: string;
  region: string;
  verified: boolean;
  verificationStatus: string;
  sellerType: string;
  accountStatus: string;
};

export type ServiceInput = { serviceId: string; selectedPrice: number; note: string; status: ServiceStatus };
export const NOTE_MAX = 2000;
