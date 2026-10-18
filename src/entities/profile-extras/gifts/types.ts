export type Gift = {
  id: string;
  workId: string;
  direction: string;
  recipientPhone: string;
  title: string;
  isService: boolean;
  termMonths: number;
  shareUrl: string;
  qrUrl: string;
  code: string;
  status: string;
  createdAt: string;
};

export type GiftCreated = { id: string; workId: string; status: string; code: string; shareUrl: string; qrUrl: string; paymentId: string; paymentUrl: string; paymentStatus: string };
export type GiftClaim = { status: string; startsAt: string; endsAt: string };
export type GiftInput = { planSlug?: string; serviceId?: string; months: number; hint: string; phone: string; message: string };

export const isClaimed = (g: Pick<Gift, "status">): boolean => g.status === "claimed" || g.status === "activated";
