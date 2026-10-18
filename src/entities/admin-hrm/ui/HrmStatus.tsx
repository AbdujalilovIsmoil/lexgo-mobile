import { Pill, type PillTone } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { stLabel } from "../lib/labels";

const TONE: Record<string, PillTone> = {
  done: "ok", present: "ok", active: "ok", approved: "ok", paid: "ok", read: "ok", completed: "ok",
  accepted: "blue", in_progress: "blue", sent: "blue",
  new: "warn", pending: "warn", in_review: "warn", returned: "warn", paused: "warn", draft: "warn", late: "warn", unread: "warn",
  cancelled: "err", rejected: "err", absent: "err", failed: "err",
};

// Any HRM status as a coloured pill; labels come from admHrm.st, unknown codes are tidied.
export function HrmStatus({ status }: { status: string }) {
  const { t } = useT();
  const key = status.trim().toLowerCase();
  return <Pill label={stLabel(t, status)} tone={TONE[key] ?? "gray"} small />;
}
