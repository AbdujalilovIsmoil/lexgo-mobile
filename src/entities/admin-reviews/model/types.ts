export type Review = {
  id: string;
  status: string;
  lawyerName: string;
  lawyerUserId: string;
  sellerType: string;
  rating: number;
  comment: string;
  note: string;
  createdAt: string;
};

export type ReviewFilter = { status: string; sellerType: string; rating: number };
export type Person = { id: string; name: string; phone: string };

export type ReviewDetail = {
  review: Review;
  workId: string;
  seller: Person | null;
  sellerRegion: string;
  client: Person | null;
  caseTitle: string;
  orderId: string;
};

export type Moderation = { status: "approved" | "rejected"; note: string };
