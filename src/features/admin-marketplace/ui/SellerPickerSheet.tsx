import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { listSellers, type MktSeller } from "@/entities/admin-marketplace";
import { BottomSheet, EmptyState, Icon, Input, SheetScroll, Skeleton } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; onPick: (s: MktSeller) => void };

// Find a seller by name, phone or LexGo id (GET /admin/marketplace/sellers?q=) and pick one.
export function SellerPickerSheet({ visible, onClose, onPick }: Props) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const query = useQuery({ queryKey: ["admin-marketplace", "seller-pick", dq], queryFn: () => listSellers({ q: dq, dateFrom: "", dateTo: "" }, 20, 0), enabled: visible });
  const rows = query.data?.items ?? [];
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("admMkt.filter.seller")} snaps={[0.7, 0.94]}>
      <View style={s.search}><Input value={q} onChangeText={setQ} placeholder={t("admMkt.filter.sellerSearch")} left={<Icon name="search" size={18} tone="gray" />} autoCapitalize="none" autoCorrect={false} /></View>
      <SheetScroll>
        {query.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} height={72} round={20} />) : null}
        {rows.map((r) => (
          <RowCard key={r.userId} avatar={r.name || r.phone || "?"} title={r.name || r.phone || "—"} subtitle={[r.lexgoId, r.phone].filter(Boolean).join(" · ")} onPress={() => { onPick(r); onClose(); }} />
        ))}
        {query.data && !rows.length ? <EmptyState compact icon="user-x" title={t("admMkt.sellers.empty")} /> : null}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ search: { paddingHorizontal: 18, paddingBottom: 8 } });
