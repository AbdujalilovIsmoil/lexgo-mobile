export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  servicesCount: number;
  subcategoriesCount: number;
  subcategories: { title: string; servicesCount: number; samples: string[] }[];
};

// One catalogue row. The list endpoints are light (no description / fields);
// those arrive with the passport and the document-fields endpoints.
export type Service = {
  id: string;
  name: string;
  slug: string;
  categoryId?: string;
  categoryTitle?: string;
  subcategory?: string;
  catalogCode?: string;
  price?: number;
  currency: string;
  free: boolean;
  deliveryMinutes: number;
  description?: string;
  isActive: boolean;
  advokatRequired: boolean;
  executorType?: string;
  documentTemplateId?: string;
};

// A service with a document template runs the manual / AI / advocate flows.
export const hasTemplate = (s: Pick<Service, "documentTemplateId">): boolean => !!s.documentTemplateId;
