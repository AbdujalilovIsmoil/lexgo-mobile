export type SellerRequest = {
  id: string;
  verificationId: string;
  status: string;
  role: string;
  name: string;
  phone: string;
  region: string;
  workId: string;
  createdAt: string;
};

export type SellerStats = { total: number; advokat: number; yurist: number; advokatTashkiloti: number; pending: number; approved: number; rejected: number };
export type SellerFilter = { status: string; role: string; from: string; to: string };
export type SellerFeed = { items: SellerRequest[]; stats: SellerStats };

export type ProofDoc = { id: string; kind: string; createdAt: string };
export type VerifyItem = { key: string; label: string; status: string; note: string };
export type ActivityRow = { id: string; action: string; detail: string; titleUz: string; descriptionUz: string; createdAt: string };

export type PendingInfo = { name: string; region: string; phone: string; status: string; attempts: number; blockedUntil: string; expiresAt: string };
export type RegUser = { id: string; lexgoId: string; name: string; role: string; accountStatus: string; createdAt: string };
export type RegProfile = { region: string; specializations: string[]; experienceYears: number; verified: boolean };

export type RegDetail = {
  request: SellerRequest;
  pending: PendingInfo | null;
  user: RegUser | null;
  profile: RegProfile | null;
  docs: ProofDoc[];
  items: VerifyItem[];
  activity: ActivityRow[];
};
