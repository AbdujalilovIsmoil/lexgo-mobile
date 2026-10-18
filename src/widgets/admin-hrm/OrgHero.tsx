import { unitTypeLabel, useBoard, usePositions } from "@/entities/admin-hrm";
import { CcHero } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

const COLORS: Record<string, string> = { company: "#6366F1", department: "#3B82F6", team: "#06B6D4" };

// Organization card: units, people and positions, then the units split by type as a stacked bar.
export function OrgHero() {
  const { t } = useT();
  const board = useBoard().data;
  const positions = usePositions().data;
  if (!board) return null;
  const units = board.nodes.filter((n) => n.kind === "unit");
  const types = [...new Set(units.map((u) => u.unitType))];
  return (
    <CcHero
      stats={[{ value: String(board.stats.units), label: t("admHrmU.unitsN") }, { value: String(board.stats.employees), label: t("admHrmU.peopleN"), color: "#22C55E" }, { value: String(positions?.length ?? 0), label: t("admHrmB.positions") }]}
      segments={types.map((k) => { const v = units.filter((u) => u.unitType === k).length; return { key: k, value: v, color: COLORS[k] ?? "#64748B", label: `${unitTypeLabel(t, k)} ${v}` }; })}
    />
  );
}
