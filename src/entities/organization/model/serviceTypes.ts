export type ServiceStatus = "active" | "paused" | "inactive";

export type Modifier = { code: string; key: string; amount: number; percent: number };

export type PriceBand = { recommended: number; min: number; max: number; base: number; modifiers: Modifier[] };

// One service a member offers (the member's "capability" joined with the catalog entry).
export type ManagedService = {
  id: string;
  name: string;
  category: string;
  catalogPrice: number;
  catalogActive: boolean;
  advocateOnly: boolean;
  status: ServiceStatus;
  selectedPrice: number;
  effectivePrice: number;
  note: string;
  visible: boolean;
  promotedDays: number;
  promoRequest: string;
  band: PriceBand | null;
};

export type ManagedList = { sellerName: string; sellerKind: string; region: string; verified: boolean; canManage: boolean; items: ManagedService[] };

export type ServiceInput = { serviceId: string; price: number; note: string; status: ServiceStatus };

export type PromoPackage = { id: string; title: string; price: number; days: number; placement: string };

export type PromoResult = { requestId: string; amount: number; telegramSent: boolean };

// A failed save, classified for the UI (422 carries the allowed price range).
export type ServiceError = { kind: "range" | "advocateOnly" | "forbidden" | "unverified" | "notFound" | "other"; min: number; max: number; band: PriceBand | null; message: string };
