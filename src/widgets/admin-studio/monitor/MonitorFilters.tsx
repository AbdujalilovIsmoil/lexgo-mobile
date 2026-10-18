import { View } from "react-native";
import { DateRangeBar, SearchBox, SelectField, type DateRange } from "@/shared/ui/admin";
import { CcFilterBox, CcTiles } from "@/shared/ui/cc";
import { useStudioText } from "@/entities/admin-studio";

type Opt = { value: string; label: string };
type Props = { codes: Opt[]; code: string; onCode: (v: string) => void; users: Opt[]; user: string; onUser: (v: string) => void; state: string; onState: (v: string) => void; q: string; onQ: (v: string) => void; bar: DateRange; online: number; total: number };

// Monitoring filters: search, online / offline tiles with counts, and period + constructor + user behind one summary row.
export function MonitorFilters({ codes, code, onCode, users, user, onUser, state, onState, q, onQ, bar, online, total }: Props) {
  const { t } = useStudioText();
  const on = [bar.preset !== "all" && (bar.preset === "custom" ? `${bar.from} – ${bar.to}` : t(`adm.${bar.preset}`)), code && codes.find((c) => c.value === code)?.label, user && users.find((u) => u.value === user)?.label].filter(Boolean);
  return (
    <View style={{ gap: 10 }}>
      <View style={{ marginHorizontal: -16 }}><SearchBox value={q} onChangeText={onQ} placeholder={t("admStudioC.mon.searchPh")} /></View>
      <View style={{ marginHorizontal: -16 }}>
        <CcTiles value={state} onChange={onState} options={[{ value: "", label: t("adm.all"), count: total }, { value: "online", label: t("admStudioC.mon.onlineNow"), count: online }, { value: "offline", label: t("admStudioC.mon.offline"), count: total - online }]} />
      </View>
      <CcFilterBox active={on.length} summary={on.length ? `${t("adm.filters")} · ${on.join(" · ")}` : undefined}>
        <DateRangeBar bar={bar} withAll />
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <SelectField label={t("admStudioC.mon.filterCtor")} value={code} options={[{ value: "", label: t("adm.all") }, ...codes]} onChange={onCode} searchable />
          <SelectField label={t("admStudioC.mon.filterUser")} value={user} options={[{ value: "", label: t("adm.all") }, ...users]} onChange={onUser} searchable />
        </View>
      </CcFilterBox>
    </View>
  );
}
