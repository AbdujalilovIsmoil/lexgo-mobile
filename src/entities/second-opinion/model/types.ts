// "Ikkinchi fikr — advokatlar guruhi": the benefit-first promotion on a paid marketplace order, the selection step and the quote.
export type Placement = "in_progress" | "completed";
export type PromoEventName = "impression" | "click" | "dismiss" | "selection_started" | "quote_viewed" | "request_created" | "purchased";
export type SoChannel = "video" | "chat";

// GET …/second-opinion-promotion. Never carries a price: `priceVisible` is authoritative and the card shows none.
export type Promotion = {
  visible: boolean;
  orderId: string;
  placement: Placement;
  title: string;
  description: string;
  benefits: string[];
  dismissible: boolean;
  dismissedForSession: boolean;
  priceVisible: boolean;
  ctaLabel: string;
  optionsUrl: string;
  quoteUrl: string;
  eventUrl: string;
};

// GET …/second-opinion/options — what the selection step collects. No price either.
export type SoOptions = {
  orderId: string;
  serviceTitle: string;
  channels: { value: SoChannel; label: string }[];
  minCount: number;
  maxCount: number;
  defaultCount: number;
  directionSuggestions: string[];
  quoteUrl: string;
};

// What the client picked.
export type SoSelection = { channel: SoChannel | ""; count: number; directions: string[] };

// POST …/second-opinion/quote — the first place a price may be shown.
export type SoQuote = {
  channel: SoChannel;
  count: number;
  directions: string[];
  amount: number;
  currency: string;
  priceVisible: boolean;
  selectionComplete: boolean;
  requestUrl: string;
  requestPayload: Record<string, unknown>;
};

// What POST /urgent-advokat/requests answered: where to go next.
export type SoCreated = { id: string; workId: string };

export type SoErrorKind =
  | "unauthorized"
  | "order_not_found"
  | "not_available"
  | "placement_mismatch"
  | "channel_required"
  | "count_invalid"
  | "previous_service_required"
  | "network"
  | "other";
