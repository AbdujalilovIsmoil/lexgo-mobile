import type { CalEvent } from "../model/types";

export const EVENT_TYPES = ["hearing", "investigative", "meeting", "filing_deadline", "appeal_deadline"] as const;
export const REMINDERS = [0, 15, 30, 60, 1440] as const; // minutes before; 0 = none (shown as "no reminder")
export const DEADLINE_KINDS = ["appeal", "document", "complaint", "general"] as const;

export const EVENT_TINT: Record<string, string> = {
  hearing: "#EF4444",
  investigative: "#F59E0B",
  meeting: "#3B82F6",
  filing_deadline: "#8B5CF6",
  appeal_deadline: "#EC4899",
};
export const tintOf = (type: string): string => EVENT_TINT[type] ?? "#3B82F6";

export const isCancelled = (e: CalEvent): boolean => e.status === "cancelled" || e.status === "canceled";
