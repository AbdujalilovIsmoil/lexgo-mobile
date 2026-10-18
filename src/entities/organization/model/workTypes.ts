import type { Organization } from "./types";

export type Workload = { orders: number; cases: number; urgent: number };

// A member as the owner dashboard shows it: membership + profile + live workload.
export type OrgMember = {
  userId: string;
  name: string;
  phone: string;
  lexgoId: string;
  title: string;
  status: string;
  sellerType: string;
  region: string;
  specializations: string[];
  verification: string;
  rating: number;
  reviews: number;
  workload: Workload;
};

export type WorkKind = "order" | "case" | "urgent";

export type WorkItem = {
  id: string;
  workId: string;
  kind: WorkKind;
  title: string;
  subtitle: string;
  status: string;
  stage: string;
  paymentStatus: string;
  memberUserId: string;
  clientName: string;
  amount: number;
  deadlineAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Summary = { members: number; verified: number; orders: number; cases: number; urgent: number };

export type Dashboard = { org: Organization; summary: Summary; members: OrgMember[]; orders: WorkItem[]; cases: WorkItem[]; urgent: WorkItem[] };

// What the first pages of /owner/workload add up to (the dashboard has no money or history).
export type OwnerStats = { orders: number; completed: number; cancelled: number; revenue: number; sampled: number; truncated: boolean; paid: WorkItem[]; byMember: Record<string, { orders: number; completed: number; revenue: number }> };
