import { View } from "react-native";
import type { SellerStats } from "@/entities/admin-reg";
import type { DateRange } from "@/shared/ui/admin";
import { CcHero, CcTiles } from "@/shared/ui/cc";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { RegFilters } from "./RegFilters";

type Props = { stats?: SellerStats; status: string; onStatus: (v: string) => void; role: string; onRole: (v: string) => void; bar: DateRange };

// Hero with the queue totals, status tiles (count on top, pending in red) and the collapsed role / period filters.
export function RegHeader({ stats: s, status, onStatus, role, onRole, bar }: Props) {
  const { t } = useT();
  const c = useColors();
  const n = (v?: number) => v ?? 0;
  const options = (["pending", "approved", "rejected"] as const).map((k) => ({ value: k, label: t(`admSt.${k}`), count: n(s?.[k]), alert: k === "pending" }));
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <CcHero
        stats={[{ value: String(n(s?.total)), label: t("adm.total") }, { value: String(n(s?.pending)), label: t("admSt.pending"), color: n(s?.pending) ? c.warn : undefined }, { value: String(n(s?.approved)), label: t("admSt.approved"), color: c.ok }]}
        segments={[{ key: "p", value: n(s?.pending), color: c.warn, label: `${t("admSt.pending")} ${n(s?.pending)}` }, { key: "a", value: n(s?.approved), color: c.ok, label: `${t("admSt.approved")} ${n(s?.approved)}` }, { key: "r", value: n(s?.rejected), color: c.err, label: `${t("admSt.rejected")} ${n(s?.rejected)}` }]}
      />
      <View style={{ marginHorizontal: -16 }}><CcTiles options={options} value={status} onChange={onStatus} /></View>
      <RegFilters role={role} onRole={onRole} bar={bar} stats={s} />
    </View>
  );
}
