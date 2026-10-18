// One tariff of a service package (GET /service-packages row).
export type ServicePackage = {
  id: string;
  code: string;
  title: string;
  tariff: string; // BASIC | STANDARD | PREMIUM
  price: number;
  slug: string;
  categoryTitle: string;
  relatedServiceCodes: string;
  duration: string;
  result: string;
  included: string[];
  excluded: string[];
  active: boolean;
};

export const TIERS = ["BASIC", "STANDARD", "PREMIUM"] as const;
export type CatalogEntry = { id: string; price: number };
