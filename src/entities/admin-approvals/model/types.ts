export type Approval = {
  id: string;
  workId: string;
  type: string;
  status: string;
  adminApproved: boolean;
  managerApproved: boolean;
  reason: string;
  summary: string; // name · phone from the request payload, when it has them
  payload: Record<string, unknown>;
  createdAt: string;
};

export type Step = "admin" | "manager";
