import { StyleSheet, View } from "react-native";
import { Skeleton, Text } from "@/shared/ui";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { useOrderPanel, SellerSort } from "../model/useOrderPanel";
import { SellerRow } from "./SellerRow";

type Props = { f: ReturnType<typeof useOrderPanel>; preName: string; preId: string };

// "Choose an advocate": sortable list (best match first), the pick is required to buy.
export function SellerPicker({ f, preName, preId }: Props) {
  const { t } = useT();
  const sorts: SellerSort[] = ["match", "rating", "exp", "price"];
  const label: Record<SellerSort, string> = { match: "csv.sortMatch", rating: "csv.sortRating", exp: "csv.sortExp", price: "csv.sortPrice" };
  return (
    <View style={s.col}>
      <Text variant="h4">{t("csv.chooseAdvocate")}</Text>
      {f.sortable ? <SelectField label={t("csv.sortLabel")} value={f.sort} options={sorts.map((v) => ({ value: v, label: t(label[v]) }))} onChange={f.setSort} /> : null}
      {preId && f.preOffers === false ? <Text variant="small" tone="warn">{t("csv.preSellerNotOffering", { name: preName || t("csv.preSellerAnon") })}</Text> : null}
      {f.sellers.isPending ? (
        [0, 1].map((i) => <Skeleton key={i} height={72} round={18} />)
      ) : !f.sorted.length ? (
        <Text variant="small" tone="gray">{t("csv.noSellers")}</Text>
      ) : (
        f.sorted.filter((l) => l.userId).map((l) => <SellerRow key={l.userId} seller={l} match={f.score.get(l.userId)} on={f.sellerId === l.userId} bad={f.missing} onPress={() => f.setSellerId(l.userId)} />)
      )}
      {f.missing ? <Text variant="small" tone="err">{t("csv.sellerRequired")}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10 } });
