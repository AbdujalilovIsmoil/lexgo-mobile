export type Invite = { name: string; phone: string; status: string; reward: number; joinedAt: string };

export type Referral = {
  code: string;
  link: string;
  qrPath: string;
  invited: number;
  joined: number;
  reward: number;
  discountUnlocked: boolean;
  discountPercent: number;
  eligibleAfter: number;
  remaining: number;
  appliesTo: string[];
  items: Invite[];
};
