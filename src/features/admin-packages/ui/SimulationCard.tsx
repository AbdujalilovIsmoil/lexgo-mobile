import type { PkgDraft } from "@/entities/admin-packages";
import { useSimulation } from "@/entities/admin-packages";
import { FactRows } from "@/shared/ui/admin";
import { ErrorView, Skeleton, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// The server's price simulator for the package being edited: what the client pays, what is saved, who gets what.
export function SimulationCard({ draft }: { draft: PkgDraft }) {
  const { t } = useT();
  const q = useSimulation(draft, true);
  const som = (n: number) => `${fmtMoney(n)} ${t("adm.currency")}`;
  if (!draft.components.length) return <Text variant="caption" tone="gray2">{t("ag5.simHint")}</Text>;
  if (q.isLoading) return <Skeleton height={120} round={16} />;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => void q.refetch()} />;
  const s = q.data;
  return s ? <FactRows rows={[
    { label: t("ag5.sim.price"), value: som(s.price) }, { label: t("ag5.sim.separate"), value: som(s.separate) }, { label: t("ag5.sim.savings"), value: som(s.savings) },
    { label: t("ag5.sim.seller"), value: som(s.seller) }, { label: t("ag5.sim.lexgo"), value: som(s.lexgo) },
  ]} /> : null;
}
