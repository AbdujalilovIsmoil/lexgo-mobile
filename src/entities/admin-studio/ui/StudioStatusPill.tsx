import { Pill, type IconName, type PillTone } from "@/shared/ui";
import { useStudioText } from "../model/useStudioText";
import type { StudioStatus } from "../model/types";

const TONE: Record<StudioStatus, PillTone> = { draft: "gray", submitted: "warn", in_review: "blue", changes_requested: "warn", approved: "cy", published: "ok", archived: "gray" };
const ICON: Record<StudioStatus, IconName> = { draft: "edit-3", submitted: "send", in_review: "clock", changes_requested: "rotate-ccw", approved: "check-circle", published: "upload-cloud", archived: "archive" };

// Workflow status of a studio object or version; a rejected one reads "Rejected".
export function StudioStatusPill({ status, raw = "", small = true }: { status: StudioStatus; raw?: string; small?: boolean }) {
  const { status: label } = useStudioText();
  const rejected = /^(rejected|declined)$/i.test(raw.trim());
  return <Pill label={label(status, raw)} tone={rejected ? "err" : TONE[status]} icon={rejected ? "x-circle" : ICON[status]} small={small} />;
}
