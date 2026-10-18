// One Studio package as the seller sees it (GET /lawyers/me/packages/manage). Price and content are read-only (TZ 5.2).
export type PackTier = { tier: string; title: string; price: number; duration: string; included: string[]; eligible: boolean; reasons: string[] };

export type SellerPackage = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  enabled: boolean;
  status: string; // active | disabled | "" while never enabled
  priceEditable: boolean; // always false for a package
  eligible: boolean;
  reasons: string[]; // the backend's own eligibility texts (e.g. the PREMIUM extended-verification requirement)
  tiers: PackTier[];
  items: string[]; // component services + custom items, by title
};
