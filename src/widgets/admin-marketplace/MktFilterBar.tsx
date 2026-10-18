import { useState } from "react";
import { View } from "react-native";
import { PartyFilter, SellerPickerSheet, type MktFilters } from "@/features/admin-marketplace";
import { UserPickerSheet } from "@/features/admin-user-picker";
import { MKT_STATUSES } from "@/entities/admin-marketplace";
import { Button, Icon, PressableScale, Text } from "@/shared/ui";
import { ChipBar, DateRangeBar } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useScopeText } from "./useScopeText";

// Period, status, seller and client filters behind one "Filter" row that shows the active scope; it opens on tap, so the
// numbers stay above the fold. The sellers tab only takes the period.
export function MktFilterBar({ f, withParties }: { f: MktFilters; withParties: boolean }) {
  const { t } = useT();
  const c = useColors();
  const scope = useScopeText(f);
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<"" | "seller" | "client">("");
  const status = [{ value: "", label: t("adm.all") }, ...MKT_STATUSES.map((s) => ({ value: s as string, label: t(`admMkt.filter.statusOpt.${s}`) }))];
  return (
    <View style={{ gap: 10, paddingBottom: 10, marginHorizontal: -16 }}>
      <PressableScale onPress={() => setOpen((v) => !v)} scale={0.98} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, paddingHorizontal: 14, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: f.active ? c.accent : c.line, backgroundColor: c.surface }}>
        <Icon name="sliders" size={18} color={f.active ? c.accent : c.gray} />
        <Text variant="small" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>{scope || t("adm.filters")}</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={16} tone="gray" />
      </PressableScale>
      {open ? <DateRangeBar bar={f.bar} withAll /> : null}
      {open && withParties ? (
        <>
          <ChipBar options={status} value={f.status} onChange={f.setStatus} />
          <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16 }}>
            <PartyFilter label={t("admMkt.filter.seller")} icon="briefcase" value={f.seller} placeholder={t("admMkt.filter.sellerPh")} onOpen={() => setPick("seller")} onClear={() => f.setSeller(null)} />
            <PartyFilter label={t("admMkt.filter.client")} icon="user" value={f.client} placeholder={t("admMkt.filter.clientPh")} onOpen={() => setPick("client")} onClear={() => f.setClient(null)} />
          </View>
        </>
      ) : null}
      {open && f.active ? <View style={{ paddingHorizontal: 16 }}><Button title={t("admMkt.filter.reset")} variant="soft" size="sm" icon="x" onPress={f.reset} /></View> : null}
      <SellerPickerSheet visible={pick === "seller"} onClose={() => setPick("")} onPick={(s) => f.setSeller({ id: s.userId, label: s.name || s.phone || s.lexgoId })} />
      <UserPickerSheet visible={pick === "client"} onClose={() => setPick("")} title={t("admMkt.filter.client")} onPick={(u) => f.setClient({ id: u.id, label: u.name || u.phone || u.lexgoId })} />
    </View>
  );
}
