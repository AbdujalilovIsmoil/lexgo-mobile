export type Offer = {
  id: string; workId: string; title: string; status: string; price: number; clientId: string; planId: string; serviceId: string;
  reason: string; validUntil: string; redemptions: number; createdAt: string;
};
export type OfferInput = { clientId: string; title: string; price: number; planId: string; reason: string; validUntil: string };
