import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { PartyFilter, SellerPickerSheet, type MktFilters, type Party } from "@/features/admin-marketplace";
import { UserPickerSheet } from "@/features/admin-user-picker";
import { MKT_STATUSES, statusColor } from "@/entities/admin-marketplace";
import { BottomSheet, Button, IconButton, SheetOption, SheetScroll, Text } from "@/shared/ui";
import { PeriodPicker, useDateRange } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

type Props = { f: MktFilters; visible: boolean; onClose: () => void; withParties: boolean };

// Status, seller, client and period of the monitor in one bottom sheet; nothing changes until the pinned button. The seller /
// client pickers open inside this sheet. The sellers tab only takes the period.
export function MktFilterSheet({ f, visible, onClose, withParties }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const [status, setStatus] = useState(f.status);
  const [seller, setSeller] = useState<Party | null>(f.seller);
  const [client, setClient] = useState<Party | null>(f.client);
  const [pick, setPick] = useState<"" | "seller" | "client">("");
  const draft = useDateRange("all");
  const [seen, setSeen] = useState(visible);
  if (visible !== seen) {
    setSeen(visible);
    if (visible) {
      setStatus(f.status);
      setSeller(f.seller);
      setClient(f.client);
      setPick("");
      draft.setPreset(f.bar.preset);
      draft.setFrom(f.bar.from);
      draft.setTo(f.bar.to);
    }
  }
  const apply = () => {
    f.bar.setPreset(draft.preset);
    f.bar.setFrom(draft.from);
    f.bar.setTo(draft.to);
    if (withParties) {
      f.setStatus(status);
      f.setSeller(seller);
      f.setClient(client);
    }
    onClose();
  };
  const reset = () => { setStatus(""); setSeller(null); setClient(null); draft.setPreset("all"); draft.setFrom(""); draft.setTo(""); };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("adm.filters")} snaps={[0.8, 0.94]}>
      <View style={s.flex}>
        <SheetScroll>
          {withParties ? (
            <>
              <View style={s.group}>
                <Text variant="small" tone="gray">{t("adm.status")}</Text>
                <SheetOption on={status === ""} label={t("adm.all")} onPress={() => setStatus("")} />
                {MKT_STATUSES.map((v) => <SheetOption key={v} on={status === v} label={t(`admMkt.filter.statusOpt.${v}`)} color={statusColor(v)} onPress={() => setStatus(v)} />)}
              </View>
              <View style={s.group}>
                <PartyFilter label={t("admMkt.filter.seller")} icon="briefcase" value={seller} placeholder={t("admMkt.filter.sellerPh")} onOpen={() => setPick("seller")} onClear={() => setSeller(null)} />
                <PartyFilter label={t("admMkt.filter.client")} icon="user" value={client} placeholder={t("admMkt.filter.clientPh")} onOpen={() => setPick("client")} onClear={() => setClient(null)} />
              </View>
            </>
          ) : null}
          <PeriodPicker bar={draft} label={t("pyx.period")} />
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("admMkt.filter.reset")} onPress={reset} />
          <Button title={t("adm.apply")} variant="gradient" full style={s.flex} onPress={apply} />
        </View>
      </View>
      <SellerPickerSheet visible={pick === "seller"} onClose={() => setPick("")} onPick={(x) => setSeller({ id: x.userId, label: x.name || x.phone || x.lexgoId })} />
      <UserPickerSheet visible={pick === "client"} onClose={() => setPick("")} title={t("admMkt.filter.client")} onPick={(u) => setClient({ id: u.id, label: u.name || u.phone || u.lexgoId })} />
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 12, marginBottom: 20 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
