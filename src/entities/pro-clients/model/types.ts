export type ProClient = {
  id: string;
  name: string;
  phone: string;
  casesCount: number;
  ordersCount: number;
  activeCaseIds: string[];
  hasConflict: boolean;
  lastActiveAt: string;
};

export type Linked = { id: string; title: string; sub: string; status: string; at: string };

export type ClientDetail = {
  manual: boolean;
  id: string;
  name: string;
  phone: string;
  region: string;
  company: string;
  notes: string;
  createdAt: string;
  cases: Linked[];
  orders: Linked[];
  payments: Linked[];
  documents: Linked[];
  timeline: (Linked & { type: string })[];
  chats: { id: string; status: string; caseId: string; orderId: string }[];
};

// Own-base client (outside LexGo), used by the conflict check together with real orders and cases.
export type ManualClient = { name: string; phone?: string; pinfl?: string; company?: string; opponents: string[]; representatives: string[]; notes?: string };

export type ConflictMatch = { title: string; reason: string };
export type ConflictInput = { phone?: string; pinfl?: string; opponent?: string; representatives: string[] };
export type ConflictResult = { clear: boolean; matches: ConflictMatch[] };
