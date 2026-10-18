export type ProCase = {
  id: string;
  workId: string;
  number: string;
  clientUserId: string;
  lawyerUserId: string;
  orderId: string;
  type: string;
  stage: string;
  status: string; // new · active · investigation · court · appeal · completed · archived
  title: string;
  description: string;
  nextAction: string;
  deadlineAt: string;
  createdAt: string;
  updatedAt: string;
};

// PATCH /cases/{id}; POST /cases takes the same keys plus order_id.
export type CaseInput = {
  title?: string;
  case_type?: string;
  stage?: string;
  status?: string;
  description?: string;
  next_action?: string;
  deadline_at?: string | null;
  lawyer_user_id?: string;
};

export type TimelineItem = { id: string; kind: string; title: string; stage: string; status: string; nextAction: string; createdAt: string };
export type CaseDoc = { id: string; workId: string; title: string; status: string; caseId: string; createdAt: string };
export type CaseAiTool = "summary" | "chronology" | "missing_docs" | "questions";
