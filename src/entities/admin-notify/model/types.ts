export type DeliveryTone = "delivered" | "pending" | "failed" | "unknown";
export type Delivery = { channel: string; status: string; tone: DeliveryTone };

export type SendInput = {
  userId?: string; // exactly one of userId / audienceRole
  audienceRole?: string;
  channel: string;
  category: string;
  title: string;
  body: string;
};
export type SendResult = { id: string; deliveries: Delivery[] };

// One line of the send report: a person (or a whole role) and how it went.
export type Outcome = { id: string; name: string; ok: boolean; deliveries: Delivery[]; reason?: string };
export type Summary = { results: Outcome[]; stopped: boolean };
