import { useMemo } from "react";
import { useNames, type Employee } from "@/entities/admin-hrm";
import { CcHero } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

const COLORS = ["#6366F1", "#3B82F6", "#06B6D4", "#22C55E", "#F59E0B", "#64748B"];

// Headcount card: total, active and inactive people, then one stacked bar of the biggest units.
export function EmployeesHero({ all }: { all: Employee[] }) {
  const { t } = useT();
  const names = useNames();
  const segments = useMemo(() => {
    const by = new Map<string, number>();
    for (const e of all) by.set(e.assignment?.unitId ?? "", (by.get(e.assignment?.unitId ?? "") ?? 0) + 1);
    const top = [...by.entries()].sort((a, b) => b[1] - a[1]);
    const rest = top.slice(5).reduce((n, [, v]) => n + v, 0);
    const seg = top.slice(0, 5).map(([id, value], i) => ({ key: id || "-", value, color: COLORS[i], label: `${id ? names.unit(id) || t("admHrmU.noUnit") : t("admHrmU.noUnit")} ${value}` }));
    return rest ? [...seg, { key: "rest", value: rest, color: COLORS[5], label: `… ${rest}` }] : seg;
  }, [all, names, t]);
  const active = all.filter((e) => e.status === "active").length;
  return (
    <CcHero
      stats={[{ value: String(all.length), label: t("admHrmU.empN") }, { value: String(active), label: t("admHrmU.activeN"), color: "#22C55E" }, { value: String(all.length - active), label: t("admHrmU.inactiveN") }]}
      segments={segments}
    />
  );
}
