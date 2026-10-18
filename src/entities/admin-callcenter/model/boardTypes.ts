export type BoardLead = {
  id: string;
  workId: string;
  name: string;
  phone: string;
  source: string;
  category: string;
  region: string;
  urgency: string;
  score: string; // hot | warm | cold | ""
  createdAt: string;
  assignedTo: string; // operator user id, "" = unassigned
  clientUserId: string;
  details: Record<string, unknown>; // raw details: PATCH replaces them, so callers merge
};

export type BoardColumn = { key: string; title: string; color: string; order: number; isFinal: boolean; count: number; cards: BoardLead[] };

export type Operator = { id: string; name: string; phone: string };

export type LeadFilter = { q: string; region: string; score: string; assignee: string; from: string; to: string };
export const EMPTY_FILTER: LeadFilter = { q: "", region: "", score: "", assignee: "", from: "", to: "" };
export const LOST_REASONS = ["price", "solved_self", "competitor", "no_answer", "no_service", "spam"] as const;
