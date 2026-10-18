// One seller who enabled a package (GET /service-packages/{id}/eligible-sellers). The backend's order is authoritative.
export type PackageSeller = {
  userId: string;
  name: string;
  publicId: string;
  rating: number;
  reviews: number;
  completed: number;
  trust: number;
  online: boolean;
  verified: boolean; // LexGo extended verification
  badge: string;
  eligible: boolean;
  reasons: string[];
  providerTier: string;
  purchaseUrl: string; // package_purchase_url: the only path the purchase request goes to
};

export type SellerPage = { items: PackageSeller[]; hasMore: boolean; offset: number; policy: Record<string, string> };
