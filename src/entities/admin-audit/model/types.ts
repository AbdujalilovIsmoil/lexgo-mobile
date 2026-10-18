export type AuditEntry = {
  id: string;
  action: string;
  detail: string;
  titleUz: string;
  descriptionUz: string;
  ip: string;
  createdAt: string;
  previousHash: string;
  eventHash: string;
  userId: string;
  targetType: string;
  targetId: string;
  outcome: string;
};

export type AuditFilters = { dateFrom: string; dateTo: string; userId: string; action: string; targetType: string; targetId: string };

export type SecurityEvent = {
  id: string;
  type: string;
  title: string;
  status: string;
  ownerUserId: string;
  previousIp: string;
  currentIp: string;
  createdAt: string;
};

// linked = previous hash equals the neighbour's event hash; linkedFar = another row of the list;
// outside = the previous record is not in this list (unverifiable, NOT tampered).
export type ChainState = "linked" | "linkedFar" | "outside" | "genesis" | "none";
export type Chain = { states: ChainState[]; hashed: number; linked: number; total: number };
