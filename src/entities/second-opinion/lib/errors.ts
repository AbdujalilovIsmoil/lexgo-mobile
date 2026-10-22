import { ApiError } from "@/shared/api";
import type { SoErrorKind } from "../model/types";

// The README's error table. The code decides first; the status is the fallback.
export function soErrorKind(e: unknown): SoErrorKind {
  if (!(e instanceof ApiError)) return "other";
  if (e.status === 0) return "network";
  if (e.status === 401) return "unauthorized";
  switch (e.code) {
    case "source_order_not_found": return "order_not_found";
    case "second_opinion_not_available": return "not_available";
    case "second_opinion_placement_mismatch": return "placement_mismatch";
    case "second_opinion_channel_required": return "channel_required";
    case "second_opinion_lawyer_count_invalid": return "count_invalid";
    case "previous_lexgo_advokat_service_required": return "previous_service_required";
  }
  if (e.status === 404) return "order_not_found";
  if (e.status === 402) return "previous_service_required";
  return "other";
}
