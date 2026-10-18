import { Button, IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useWorkloadExport } from "../model/useWorkloadExport";

type Props = { orgId: string; memberId?: string; status?: string; nameOf: (id: string) => string; compact?: boolean };

// Export the (filtered) workload as a CSV file: a labelled button, or an icon button when `compact`.
export function ExportButton({ orgId, memberId = "", status = "", nameOf, compact }: Props) {
  const { t } = useT();
  const x = useWorkloadExport(orgId, memberId, status, nameOf);
  if (compact) return <IconButton icon="download" size={40} label={t("og8.exportCsv")} onPress={() => void x.run()} />;
  return <Button title={t("og8.exportCsv")} icon="download" variant="soft" size="sm" loading={x.busy} onPress={() => void x.run()} />;
}
