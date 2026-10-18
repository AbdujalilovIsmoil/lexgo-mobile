import { Pill, type PillTone } from "@/shared/ui";
import { useUrgentLabels } from "../model/useLabels";

const TONE: Record<string, PillTone> = {
  open_pool: "blue", claimed: "cy", scheduled: "warn", in_progress: "cy", meeting_active: "ok", completed: "ok", cancelled: "err", expired: "gray",
};

// A record's status as a coloured, translated pill (unknown statuses are tidied, never raw).
export function StatusBadge({ status, small = true }: { status: string; small?: boolean }) {
  const label = useUrgentLabels();
  const live = ["open_pool", "claimed", "scheduled", "in_progress", "meeting_active"].includes(status || "open_pool");
  return <Pill small={small} tone={TONE[status || "open_pool"] ?? "gray"} label={label.status(status)} live={live} />;
}
