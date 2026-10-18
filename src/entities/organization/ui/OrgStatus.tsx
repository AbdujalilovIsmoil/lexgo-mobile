import { Pill } from "@/shared/ui";
import { statusTone } from "../lib/status";
import { useOrgText } from "../lib/useOrgText";

// A backend status (verification, order, case …) as a coloured, translated pill.
export function OrgStatus({ status, small = true }: { status: string; small?: boolean }) {
  const text = useOrgText();
  if (!status) return null;
  return <Pill label={text.status(status)} tone={statusTone(status)} small={small} />;
}
