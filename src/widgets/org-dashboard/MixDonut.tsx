import { DonutChart } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { Summary } from "@/entities/organization";
import { KPI_TINT } from "./kpis";

// Share of orders / cases / urgent requests in the active work (hidden when nothing is active).
export function MixDonut({ summary: s }: { summary: Summary }) {
  const { t } = useT();
  if (s.orders + s.cases + s.urgent === 0) return null;
  return (
    <DonutChart
      slices={[
        { label: t("og2.orders"), value: s.orders, color: KPI_TINT.orders },
        { label: t("og2.cases"), value: s.cases, color: KPI_TINT.cases },
        { label: t("og2.urgent"), value: s.urgent, color: KPI_TINT.urgent },
      ]}
    />
  );
}
