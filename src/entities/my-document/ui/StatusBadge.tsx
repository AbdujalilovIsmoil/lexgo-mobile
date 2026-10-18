import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import { groupOf, toneOf } from "../lib/status";

// A document status as a coloured pill: translated when known, else the server's label. While the document is still
// moving (being filled in, awaiting payment, with the advocates) the pill carries a pulsing light; a finished or
// stopped one stays still.
export function StatusBadge({ status, label, small = true }: { status: string; label?: string; small?: boolean }) {
  const { t } = useT();
  const key = `dm2.status.${status.toLowerCase()}`;
  const text = t(key) !== key ? t(key) : label || humanizeSlug(status);
  const g = groupOf(status);
  return <Pill label={text} tone={toneOf(status)} small={small} live={g === "draft" || g === "payment" || g === "review"} />;
}
