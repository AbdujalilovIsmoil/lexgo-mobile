import { View } from "react-native";
import { ChipBar, SearchBox, SelectField } from "@/shared/ui/admin";
import { CcFilterBox, CcTiles } from "@/shared/ui/cc";
import { QUEUE_STATUSES } from "./helpers";
import { useStudioText } from "@/entities/admin-studio";

type Props = { codes: { value: string; label: string }[]; code: string; onCode: (v: string) => void; status: string; onStatus: (v: string) => void; who: string; onWho: (v: string) => void; q: string; onQ: (v: string) => void; counts: Record<string, number>; total: number };

// Queue filters: search, status tiles with counts, and constructor + "my turn" behind one summary row.
export function ApprovalFilters({ codes, code, onCode, status, onStatus, who, onWho, q, onQ, counts, total }: Props) {
  const { t, status: label } = useStudioText();
  const on = [code && codes.find((c) => c.value === code)?.label, who && t("admStudioC.filter.mine")].filter(Boolean);
  return (
    <View style={{ gap: 10 }}>
      <View style={{ marginHorizontal: -16 }}><SearchBox value={q} onChangeText={onQ} placeholder={t("admStudioC.filter.searchPh")} /></View>
      <View style={{ marginHorizontal: -16 }}>
        <CcTiles options={[{ value: "", label: t("adm.all"), count: total }, ...QUEUE_STATUSES.map((s) => ({ value: s as string, label: label(s), count: counts[s] ?? 0, alert: s === "submitted" }))]} value={status} onChange={onStatus} />
      </View>
      <CcFilterBox active={on.length} summary={on.length ? `${t("adm.filters")} · ${on.join(" · ")}` : undefined}>
        <View style={{ paddingHorizontal: 16 }}><SelectField label={t("admStudioC.filter.ctor")} value={code} options={[{ value: "", label: t("adm.all") }, ...codes]} onChange={onCode} searchable /></View>
        <ChipBar options={[{ value: "", label: t("admStudioC.filter.everyone") }, { value: "mine", label: t("admStudioC.filter.mine") }]} value={who} onChange={onWho} />
      </CcFilterBox>
    </View>
  );
}
