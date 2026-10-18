// GET /services/{id}/passport → { service, passport }. Internal money fields
// (seller_income, platform_fee) are never mapped: the client must not see them.
export type ServicePassport = {
  catalogCode: string;
  family: string;
  group: string;
  subcategory: string;
  executorType: string;
  advokatRequired: boolean;
  format: string;
  standardDuration: string;
  urgentDuration: string;
  requiredDocuments: string[];
  pricingTier: string;
  standardPrice?: number;
  refundCode: string;
  slaCode: string;
  aiCategory: string;
  version: string;
};
