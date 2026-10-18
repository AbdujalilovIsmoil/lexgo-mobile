export type UrgentPerson = { id: string; name: string; phone: string; role: string; lexgoId: string };
export type UrgentFile = { name: string; url: string; voice: boolean };
export type UrgentSource = { type: string; id: string; status: string; title: string; createdAt: string };
export type UrgentStep = { to: string; at: string };

// One Tezkor Advokat request in the shape every endpoint of the module answers with.
export type UrgentRequest = {
  id: string;
  workId: string;
  serviceKind: string;
  serviceTitle: string;
  channel: string;
  status: string;
  region: string;
  need: string;
  directions: string[];
  lawyerCount: number;
  amount: number;
  meetingMinutes: number;
  client: UrgentPerson | null;
  clientName: string;
  clientPhone: string;
  assignedLawyer: UrgentPerson | null;
  claimedBy: UrgentPerson | null;
  operator: UrgentPerson | null;
  groupLawyers: UrgentPerson[];
  claimedByUserId: string;
  assignedLawyerUserId: string;
  groupLawyerUserIds: string[];
  nextStatuses: string[];
  history: UrgentStep[];
  files: UrgentFile[];
  sources: UrgentSource[];
  scheduledAt: string;
  meetingNote: string;
  roomId: string;
  resultSummary: string;
  nextAction: string;
  completedAt: string;
  cancelReason: string;
  cancelledAt: string;
  slaBreached: boolean;
  immediateCall: boolean;
  createdAt: string;
};

export type UrgentCandidate = {
  userId: string;
  name: string;
  role: string;
  region: string;
  specializations: string[];
  rating: number;
  reviewsCount: number;
  successRate: number;
  workload: number;
  directionMatch: boolean;
  external: boolean;
  callcenter: boolean;
  score: number;
};

export type GroupInput = { lawyerUserIds: string[]; scheduledAt?: string; note?: string; allowCount?: boolean; allowDirection?: boolean };

export type AssignRefusal = { kind: "count" | "direction" | "minimum"; requested: number; selected: number; count: number } | null;
