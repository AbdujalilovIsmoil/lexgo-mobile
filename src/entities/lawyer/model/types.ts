export type LawyerKind = "advocate" | "lawyer";

export type LawyerService = {
  id: string;
  title: string;
  price: number; // what the client pays (selected → standard → base price)
  basePrice: number; // LexGo catalogue price
  category: string;
  categoryId: string;
  deliveryMinutes: number;
  note: string;
  sponsored: boolean;
};

export type LawyerReview = { id: string; rating: number; comment: string; author: string; createdAt: string; reply: string };

export type Lawyer = {
  id: string;
  userId: string;
  publicId: string; // display id (LGP-… / LG-…), never the UUID
  name: string;
  region: string;
  district?: string;
  specializations: string[];
  languages: string[];
  experienceYears: number;
  rating: number;
  reviews: number;
  rated: boolean;
  basePrice: number; // cheapest service ("from" price)
  priceTo: number;
  bio?: string;
  verified: boolean;
  badge: string; // verification badge label from the backend
  kind: LawyerKind;
  totalCases: number;
  winsCount: number;
  partialWins: number;
  successRate: number;
  completed: number;
  education?: string;
  licenseNumber?: string;
  barAssociation?: string;
  organizationName?: string;
  createdAt: string;
  isNew: boolean;
  promoted: boolean;
  promotedService?: string;
  boost: number;
  available: boolean;
  services: LawyerService[];
  reviewList: LawyerReview[];
};
