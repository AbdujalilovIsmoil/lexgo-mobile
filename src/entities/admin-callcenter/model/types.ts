// One row of GET /call-center/queue: a lead, an unassigned order or an urgent advocate request.
export type QueueItem = {
  id: string;
  type: string; // lead | order | urgent_advokat
  title: string;
  status: string;
  score: string;
  urgency: string;
  region: string;
  slaMinutes: number;
  ageMinutes: number;
  slaBreached: boolean;
  sellerLoad: number | null;
  serviceKind: string;
  channel: string;
  directions: string[];
  lawyerCount: number;
  claimed: boolean;
  createdAt: string;
};

export type CcClient = { id: string; lexgoId: string; name: string; phone: string; status: string };

// A logged call (marketplace record module "call_center_call").
export type CcCall = {
  id: string;
  direction: string;
  phone: string;
  status: string;
  createdAt: string;
  clientUserId: string;
  topic: string;
  result: string;
  nextAction: string;
  durationSec: number;
  summary: string;
};

export type CcCallInput = {
  phone: string;
  direction: string;
  status: string;
  topic: string;
  result: string;
  nextAction: string;
  durationSec: number;
  summary?: string;
  clientUserId?: string;
};
