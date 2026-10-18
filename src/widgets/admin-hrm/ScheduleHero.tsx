import type { Schedule } from "@/entities/admin-hrm";
import { CcHero } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

// Schedules card: total and active schedules, then who they cover (people / units / whole company) as a stacked bar.
export function ScheduleHero({ all }: { all: Schedule[] }) {
  const { t } = useT();
  const personal = all.filter((x) => x.employeeId).length;
  const unit = all.filter((x) => !x.employeeId && x.unitId).length;
  const active = all.filter((x) => x.status === "active").length;
  return (
    <CcHero
      stats={[{ value: String(all.length), label: t("admHrmU.schedN") }, { value: String(active), label: t("admHrmU.activeN"), color: "#22C55E" }]}
      segments={[
        { key: "p", value: personal, color: "#8B5CF6", label: `${t("admHrmU.personal")} ${personal}` }, { key: "u", value: unit, color: "#3B82F6", label: `${t("admHrmU.unitScope")} ${unit}` },
        { key: "c", value: all.length - personal - unit, color: "#06B6D4", label: `${t("admHrmU.company")} ${all.length - personal - unit}` },
      ]}
    />
  );
}
