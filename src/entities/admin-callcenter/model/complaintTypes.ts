export type Complaint = {
  id: string;
  workId: string;
  status: string;
  title: string;
  lawyerName: string;
  nextAction: string;
  hasUrgent: boolean;
  createdAt: string;
};

export type ComplaintDetail = {
  row: Complaint;
  clientName: string;
  clientPhone: string;
  rating: number;
  complaint: string;
  priority: string;
  operatorNote: string;
  resolvedAction: string;
  docTitle: string;
  docStatus: string;
  docWorkId: string;
  docFile: { path: string; name: string; mime: string } | null; // the delivered file (authenticated download)
  urgentTitle: string;
  urgentNeed: string;
  urgentStatus: string;
  urgentWorkId: string;
  actions: string[]; // rulings the backend offers for this complaint
};

export type ComplaintList = { items: Complaint[]; count: number; statuses: string[] };
export type ComplaintAction = "rework_required" | "rejected" | "resolved";
export const COMPLAINT_ACTIONS: ComplaintAction[] = ["rework_required", "rejected", "resolved"];
