export type UrgentVariant = { channel: string; price: number; pricePerLawyer: number; meetingMinutes: number };

// One orderable service of GET /urgent-advokat/catalog — price, length and eligibility come from here, never from the app.
export type UrgentService = {
  key: string;
  title: string;
  delivery: string;
  price: number;
  meetingMinutes: number;
  variants: UrgentVariant[];
  requiresPriorPurchase: boolean;
  lawyerCountMin: number;
  lawyerCountMax: number;
  variant: string; // ordinary | express | traffic_accident
  immediateCall: boolean; // rings an on-duty advocate straight away
};

// The catalog's own "show these as one choice" boxes (second opinion: single | group).
export type UrgentGroup = { key: string; title: string; items: string[] };

export type UrgentCatalog = {
  title: string;
  meetingMinutes: number;
  freeExtensionMinutes: number;
  paidExtensionPerMinute: number;
  services: UrgentService[];
  groups: UrgentGroup[];
};
