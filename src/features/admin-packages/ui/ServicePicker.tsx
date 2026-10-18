import { useState } from "react";
import { View } from "react-native";
import type { AdminService } from "@/entities/admin-services";
import { BottomSheet, EmptyState, Icon, Input, SheetScroll } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; services: AdminService[]; loading: boolean; onPick: (s: AdminService) => void };

// Search the catalogue and pick a service for a package component (the first 40 matches are listed).
export function ServicePicker({ visible, onClose, services, loading, onPick }: Props) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = services.filter((s) => s.isActive && (!needle || `${s.name} ${s.catalogCode}`.toLowerCase().includes(needle))).slice(0, 40);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("ag5.pickService")} snaps={[0.7, 0.94]}>
      <View style={{ paddingHorizontal: 18, paddingBottom: 8 }}><Input value={q} onChangeText={setQ} placeholder={t("ag5.searchService")} left={<Icon name="search" size={18} tone="gray" />} /></View>
      <SheetScroll>
        {shown.map((s) => <RowCard key={s.id} icon="file-text" title={s.name} subtitle={[s.catalogCode, s.price ? `${fmtMoney(s.price)} ${t("adm.currency")}` : ""].filter(Boolean).join(" · ")} onPress={() => { onPick(s); onClose(); }} />)}
        {!shown.length && !loading ? <EmptyState icon="search" title={t("ag5.noService")} /> : null}
      </SheetScroll>
    </BottomSheet>
  );
}
