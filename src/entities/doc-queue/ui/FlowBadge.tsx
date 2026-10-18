import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// "By template / From scratch / Review" — only for the flows the backend names.
export function FlowBadge({ flow }: { flow: string }) {
  const { t } = useT();
  const key = `ad1.flow.${flow}`;
  return flow && t(key) !== key ? <Pill label={t(key)} tone="cy" icon="layers" small /> : null;
}
