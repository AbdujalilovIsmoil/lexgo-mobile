import { View } from "react-native";
import { unitTypeLabel, type OrgBoard } from "@/entities/admin-hrm";
import { BarList, DonutChart, SectionCard } from "@/shared/ui/admin";
import { CcHero } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

const COLORS = ["#6366F1", "#3B82F6", "#06B6D4", "#22C55E", "#F59E0B", "#EC4899"];

// Organization in numbers: hero card with counters, headcount per unit and units by type.
export function OrgStatsView({ board }: { board: OrgBoard }) {
  const { t } = useT();
  const s = board.stats;
  const units = board.nodes.filter((n) => n.kind === "unit");
  const byType = [...new Set(units.map((u) => u.unitType))].map((k, i) => ({ label: unitTypeLabel(t, k), value: units.filter((u) => u.unitType === k).length, color: COLORS[i % COLORS.length] }));
  return (
    <View style={{ gap: 14, paddingBottom: 12 }}>
      <CcHero
        stats={[{ value: String(s.units), label: t("admHrmB.statUnits") }, { value: String(s.employees), label: t("admHrmB.people"), color: "#22C55E" }, { value: String(s.assignments), label: t("admHrmB.statAssign") }, { value: String(s.levels), label: t("admHrmB.statLevels") }]}
        segments={byType.map((x) => ({ key: x.label, value: x.value, color: x.color, label: `${x.label} ${x.value}` }))}
      />
      <SectionCard title={t("admHrmB.peoplePerUnit")}><BarList items={units.filter((u) => u.people > 0).sort((a, b) => b.people - a.people).slice(0, 8).map((u) => ({ label: u.label, value: u.people }))} /></SectionCard>
      <SectionCard title={t("admHrmB.unitsByType")}><DonutChart slices={byType} /></SectionCard>
    </View>
  );
}
