export const TASK_STATUSES = ["new", "accepted", "in_progress", "in_review", "done", "returned", "paused", "cancelled"] as const;
export const PRIORITIES = ["low", "normal", "high"] as const;
export const EVENT_TYPES = ["check_in", "check_out", "break_start", "break_end"] as const;
export const KPI_SOURCES = ["execution", "attendance", "sales", "manual"] as const;
export const ENTRY_TYPES = ["salary", "kpi_bonus", "sales_bonus", "one_time_bonus", "penalty", "advance", "deduction", "adjustment"] as const;
export const UNIT_TYPES = ["company", "department", "team"] as const;
export const WEEK_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export const PRIORITY_TINT: Record<string, string> = { high: "#EF4444", normal: "#3B82F6", low: "#64748B" };
