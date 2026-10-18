// One tariff of a Studio package as the seller sees it (GET /lawyers/me/packages/manage). Price and content are read-only.
export type PackageEligibility = {
  eligible: boolean;
  extendedVerified: boolean;
  baseVerified: boolean;
  reasons: string[]; // backend codes, e.g. extended_verification_required
  missingServiceIds: string[];
};

export type PackageTariffInfo = {
  id: string;
  code: string;
  groupCode: string;
  groupTitle: string;
  title: string;
  category: string;
  tariff: string; // BASIC | STANDARD | PREMIUM
  price: number;
  duration: string;
  included: string[];
};

export type SellerPackage = {
  id: string;
  pkg: PackageTariffInfo;
  enabled: boolean;
  status: "active" | "disabled";
  priceEditable: boolean;
  eligibility: PackageEligibility;
};

export type PackageState = "active" | "paused" | "available" | "blocked";
export type PackageFilter = "all" | "active" | "available" | "blocked";
