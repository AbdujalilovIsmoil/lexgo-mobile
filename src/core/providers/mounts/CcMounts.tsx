import { useAccess } from "@/entities/access";
import { useSupportBadge } from "@/entities/admin-support";
import { useComplaintEvents } from "@/features/admin-callcenter";
import { useSupportAlerts } from "@/features/admin-support";

// Call-center operator plumbing, alive on every screen: the Support tab badge (tickets waiting for an
// operator) and realtime toasts for new / transferred tickets, client messages and new quality complaints (user socket).
export function CcMounts() {
  const operator = useAccess().callCenterOperator;
  useSupportBadge(operator);
  useSupportAlerts(operator);
  useComplaintEvents(operator);
  return null;
}
