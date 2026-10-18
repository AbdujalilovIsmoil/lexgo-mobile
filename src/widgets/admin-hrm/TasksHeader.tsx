import { View } from "react-native";
import { TASK_STATUSES, STATUS_TINT, daysOverdue, isOpenTask, stLabel, useDashTasks } from "@/entities/admin-hrm";
import { SearchBox } from "@/shared/ui/admin";
import { CcHero, CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

type Props = { q: string; onQ: (v: string) => void; status: string; onStatus: (v: string) => void };

// Top of my tasks: hero (open / overdue / done + status bar), search and status tiles with live counts.
export function TasksHeader({ q, onQ, status, onStatus }: Props) {
  const { t } = useT();
  const all = useDashTasks().data ?? [];
  const count = (s: string) => all.filter((x) => x.status === s).length;
  const late = all.filter((x) => daysOverdue(x)).length;
  const tiles = [{ value: "", label: t("adm.all"), count: all.length }, ...TASK_STATUSES.map((s) => ({ value: s as string, label: stLabel(t, s), count: count(s) }))];
  return (
    <View style={{ gap: 10, marginBottom: 10 }}>
      <CcHero
        stats={[{ value: String(all.filter(isOpenTask).length), label: t("admHrmW.open") }, { value: String(late), label: t("admHrmW.overdue"), color: late ? "#EF4444" : undefined }, { value: String(count("done")), label: t("admHrmW.doneLbl"), color: "#22C55E" }]}
        segments={TASK_STATUSES.map((s) => ({ key: s, value: count(s), color: STATUS_TINT[s], label: stLabel(t, s) }))}
      />
      <View style={{ marginHorizontal: -16 }}><SearchBox value={q} onChangeText={onQ} placeholder={t("admHrm.searchTasks")} /></View>
      <View style={{ marginHorizontal: -16 }}><CcTiles options={tiles} value={status} onChange={onStatus} /></View>
    </View>
  );
}
