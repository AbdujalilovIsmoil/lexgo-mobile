export type PkgKind = "mandatory" | "optional" | "choose_one";
export type PkgComponent = { serviceId: string; clientPrice: number; sellerFee: number; kind: PkgKind; quantity: number; unit: string };
export type PkgMilestone = { index: number; title: string; percent: number; criteria: string };

// One service package (GET /admin/service-packages). Money is whole so'm.
export type Pkg = {
  id: string; workId: string; code: string; slug: string; title: string; status: string; price: number; version: number;
  createdBy: string; createdAt: string; approvedAt: string;
  components: PkgComponent[]; milestones: PkgMilestone[]; included: string[]; excluded: string[]; refundTerms: string;
  separatePrice: number; savings: number; sellerTotal: number; lexgoShare: number; pricingModel: string; regionMode: string;
};

export type PkgStatus = "draft" | "under_review" | "approved" | "on_sale" | "stopped";
export type Simulation = { price: number; separate: number; savings: number; seller: number; lexgo: number; discountPercent: number };
