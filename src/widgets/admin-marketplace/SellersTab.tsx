import { useState } from "react";
import { View } from "react-native";
import { SellerRow, useSellers, type MktSeller } from "@/entities/admin-marketplace";
import type { MktFilters } from "@/features/admin-marketplace";
import { PagedList, SearchBox } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { MktFilterBar } from "./MktFilterBar";

// Sellers tab: searchable list with order counters; a seller with orders opens the Orders tab for them.
export function SellersTab({ f, onOrders }: { f: MktFilters; onOrders: (s: MktSeller) => void }) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const dq = useDebounced(q.trim(), 300);
  const { items, total, query } = useSellers({ q: dq, dateFrom: f.scope.dateFrom, dateTo: f.scope.dateTo });
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(s) => s.userId}
      renderItem={(s) => <SellerRow item={s} onPress={() => onOrders(s)} />}
      empty={{ icon: "users", title: t("admMkt.sellers.empty"), text: dq ? t("admMkt.sellers.emptyText") : undefined }}
      header={
        <View style={{ gap: 10, paddingBottom: 10 }}>
          <View style={{ marginHorizontal: -16 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("admMkt.filter.sellerSearch")} /></View>
          <MktFilterBar f={f} withParties={false} />
          <Text variant="caption" tone="gray" style={{ marginLeft: 4 }}>{total != null ? t("admMkt.sellers.count", { n: total }) : t("admMkt.sellers.lead")}</Text>
        </View>
      }
    />
  );
}
