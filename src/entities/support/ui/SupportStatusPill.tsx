import { Pill, type PillTone } from "@/shared/ui";
import { useSupportLabels } from "./useLabels";

const TONE: Record<string, PillTone> = {
  waiting_operator: "warn", reopened: "warn", waiting_client_confirm: "warn", claimed: "ok", transferred: "blue",
  ai_handling: "cy", closed: "gray", resolved: "ok", cancelled: "err",
};

// A ticket status as a coloured pill.
export function SupportStatusPill({ status }: { status: string }) {
  const labels = useSupportLabels();
  if (!status) return null;
  return <Pill label={labels.status(status)} tone={TONE[status] ?? "gray"} small live={!["closed", "resolved", "cancelled"].includes(status)} />;
}
