export type WorkKind = "document" | "urgent" | "order" | "case" | "complaint" | "other";
// TZ 6.2 status groups; "open" is a filter value (queue + active + review), never a status group.
export type WorkGroup = "queue" | "active" | "review" | "done" | "closed";
export type WorkPerson = { name: string; role: string };

// One row of GET /clients/me/works. `id` is the record uuid (API and routes only),
// `workId` is the public id the client sees. Phones are never read.
export type Work = {
  id: string;
  workId: string;
  type: string;
  kind: WorkKind;
  title: string;
  status: string;
  statusLabel: string;
  serviceKind: string;
  assignee: WorkPerson | null;
  operator: WorkPerson | null;
  hasChat: boolean;
  hasMeeting: boolean;
  nextAction: string;
  documentRequestId: string;
  createdAt: string;
  updatedAt: string;
};

export type WorksPage = { items: Work[]; total: number };
