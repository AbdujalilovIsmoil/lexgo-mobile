import { Pill } from "@/shared/ui";
import { workGroup, workTone } from "../model/group";
import { useWorkText } from "../lib/useWorkText";

// Backend status as a coloured pill, translated into the app language.
export function WorkStatusPill({ status, label, small = true }: { status: string; label?: string; small?: boolean }) {
  const text = useWorkText();
  const g = workGroup(status);
  return <Pill label={text.status(status, label)} tone={workTone(status)} small={small} live={g === "active" || g === "review"} />;
}
