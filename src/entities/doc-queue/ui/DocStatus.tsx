import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import { statusTone } from "../model/status";

// Backend status → translated, coloured pill (`ad1.st.*`, falls back to a tidied slug).
export function DocStatus({ status, small = true }: { status: string; small?: boolean }) {
  const { t } = useT();
  const key = `ad1.st.${status}`;
  return <Pill label={t(key) === key ? humanizeSlug(status) : t(key)} tone={statusTone(status)} small={small} />;
}
