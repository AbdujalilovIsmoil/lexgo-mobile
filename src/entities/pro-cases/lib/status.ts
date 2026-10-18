export const CASE_STATUSES = ["new", "active", "investigation", "court", "appeal", "completed", "archived"] as const;
export const AI_TOOLS = ["summary", "chronology", "missing_docs", "questions"] as const;

const TINT: Record<string, string> = {
  new: "#3B82F6", active: "#22C55E", investigation: "#F59E0B", court: "#EF4444", appeal: "#EC4899", completed: "#14B8A6", archived: "#94A3B8",
};
export const caseTint = (status: string): string => TINT[status] ?? "#3B82F6";
export const isClosedCase = (status: string): boolean => status === "completed" || status === "archived";
