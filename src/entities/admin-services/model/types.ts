export type Category = { id: string; name: string; slug: string; description: string; servicesCount: number; isActive: boolean };
export type OverlaidCategory = Category & { hidden: boolean; overridden: boolean };
export type CategoryOverride = { hidden?: boolean; title?: string };

export type AdminService = {
  id: string;
  name: string; // localized display title
  title: string; // raw backend title
  slug: string;
  categoryId: string;
  categoryTitle: string;
  description: string;
  price?: number; // catalog price (standard_price, else base_price)
  basePrice?: number;
  standardPrice?: number;
  currency: string;
  deliveryMinutes?: number;
  isActive: boolean;
  catalogCode: string;
  titleUzLatn: string;
  titleUzCyrl: string;
  titleRu: string;
  executorType: string;
  advokatRequired: boolean;
  pricingTier: string;
  slaCode: string;
  refundCode: string;
  aiCategory: string;
  hasMetadata: boolean;
  documentTemplateId: string;
};

export type ServiceMetaInput = Partial<{
  title_uz_cyrl: string;
  title_uz_latn: string;
  title_ru: string;
  executor_type: string;
  advokat_required: boolean;
  pricing_tier: string;
  standard_price: number;
  sla_code: string;
  refund_code: string;
  ai_category: string;
}>;

export type ServiceUpdate = Partial<{
  category_id: string;
  slug: string;
  title: string;
  description: string;
  base_price: number;
  currency: string;
  delivery_minutes: number;
  is_active: boolean;
  metadata: ServiceMetaInput;
}>;

export type ServiceCreate = { category_id: string; slug: string; title: string; description: string; base_price: number; currency: string; delivery_minutes: number; is_active: boolean };

export type Passport = { catalogCode: string; family: string; group: string; subcategory: string; standardDuration: string; urgentDuration: string; version: string; executorType: string; advokatRequired: boolean; pricingTier: string; standardPrice?: number; slaCode: string; refundCode: string; aiCategory: string };
