import type { IconName } from "@/shared/ui";
import type { WorkKind } from "./types";

// The backend sends both "complaint" and "quality_complaint"; the client sees one kind.
export function workKind(type: string): WorkKind {
  switch (type.trim().toLowerCase()) {
    case "document_lawyer_work": return "document";
    case "urgent_advokat": return "urgent";
    case "service_order": return "order";
    case "legal_case": return "case";
    case "quality_complaint":
    case "complaint": return "complaint";
    default: return "other";
  }
}

export const KINDS: WorkKind[] = ["document", "urgent", "order", "case", "complaint", "other"];

export const KIND_ICON: Record<WorkKind, IconName> = {
  document: "file-text",
  urgent: "zap",
  order: "shopping-bag",
  case: "briefcase",
  complaint: "alert-triangle",
  other: "layers",
};

export const KIND_TINT: Record<WorkKind, string> = {
  document: "#1668F0",
  urgent: "#E0457F",
  order: "#00A870",
  case: "#7A5CFF",
  complaint: "#C2680A",
  other: "#5C6E85",
};
