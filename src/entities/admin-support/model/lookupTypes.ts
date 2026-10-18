export type AssistPlan = {
  id: string; name: string; slug: string; monthly: number; sixMonth: number; yearly: number; prepaidYearly: number;
  periods: string[]; features: string[]; targetRoles: string[]; audience: string; giftable: boolean; active: boolean; sortOrder: number;
};
export type UrgentVariant = { channel: string; price: number; pricePerLawyer: number; minutes: number };
export type UrgentService = {
  key: string; title: string; price: number; minutes: number; variants: UrgentVariant[];
  priorPurchase: boolean; lawyerMin: number; lawyerMax: number; immediate: boolean;
};
export type UrgentCatalog = { services: UrgentService[]; priced: boolean };
export type SellerService = { id: string; title: string; categoryTitle: string; price: number; currency: string };
export type Seller = { userId: string; name: string; sellerType: string; rating: number; servicesCount: number; priceFrom: number; services: SellerService[]; packageId?: string };
export type DocService = { id: string; name: string; categoryTitle: string; price: number; templateId: string };
export type DocTypes = { items: string[]; custom: boolean; appliesTo: string[]; notAppliesTo: string[] };
