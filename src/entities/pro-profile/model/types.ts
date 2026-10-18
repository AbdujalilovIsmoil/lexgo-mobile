// The seller's own profile (GET/PUT /lawyers/me) and the public flavour of the same record
// (GET /marketplace/lawyers/{id}) share one shape.
export type ProProfile = {
  userId: string;
  publicId: string;
  name: string;
  sellerType: string;
  region: string;
  district: string;
  licenseNumber: string;
  barAssociation: string;
  advocateStructure: string;
  organizationName: string;
  experienceYears: number;
  lawyerExperienceYears: number;
  specializations: string[];
  languages: string[];
  bio: string;
  education: string;
  totalCases: number;
  winsCount: number;
  partialWinsCount: number;
  successRate: number;
  hourlyPrice: number;
  verificationStatus: string;
  verified: boolean;
  badgeLabel: string;
  rating: number;
  reviewsCount: number;
  onlineNow: boolean;
  available: boolean;
  serviceTitles: string[];
  priceFrom: number;
  priceTo: number;
};

// The fields PUT /lawyers/me replaces (the endpoint is a full upsert).
export type ProfileFields = Pick<
  ProProfile,
  | "region" | "district" | "licenseNumber" | "barAssociation" | "advocateStructure" | "organizationName"
  | "experienceYears" | "lawyerExperienceYears" | "specializations" | "languages" | "bio" | "education"
  | "totalCases" | "winsCount" | "partialWinsCount" | "hourlyPrice"
>;

// Name / e-mail / photo live on the account record (GET/PUT /clients/me).
export type ProAccount = { name: string; email: string; avatarUrl: string; phone: string };
