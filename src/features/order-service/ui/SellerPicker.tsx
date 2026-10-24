import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { AUTO, type useOrderPanel, type SellerSort } from "../model/useOrderPanel";
import { SellerRow } from "./SellerRow";

type Props = { f: ReturnType<typeof useOrderPanel>; preName: string; preId: string };

// "Choose an advocate": the platform's automatic match first, then the sortable list (best match first); a pick is required to buy.
export function SellerPicker({ f, preName, preId }: Props) {
  const { t } = useT();
  const c = useColors();
  const sorts: SellerSort[] = ["match", "rating", "exp", "price"];
  const label: Record<SellerSort, string> = { match: "csv.sortMatch", rating: "csv.sortRating", exp: "csv.sortExp", price: "csv.sortPrice" };
  return (
    <View style={s.col}>
      <Text variant="h4">{t("csv.chooseAdvocate")}</Text>
      {f.sortable ? <SelectField label={t("csv.sortLabel")} value={f.sort} options={sorts.map((v) => ({ value: v, label: t(label[v]) }))} onChange={f.setSort} /> : null}
      {preId && f.preOffers === false ? <Text variant="small" tone="warn">{t("csv.preSellerNotOffering", { name: preName || t("csv.preSellerAnon") })}</Text> : null}
      <PressableScale onPress={() => f.setSellerId(AUTO)} accessibilityRole="radio" accessibilityState={{ selected: f.auto }} style={[s.auto, { borderColor: f.auto ? c.accent : f.missing ? c.err : c.line, backgroundColor: f.auto ? c.tint : c.surface }]}>
        <View style={[s.autoIcon, { backgroundColor: c.tint2 }]}><Icon name="zap" size={20} tone="accent" /></View>
        <View style={s.flex}>
          <Text variant="body" weight="semibold">{t("mf.create.auto")}</Text>
          <Text variant="caption" tone="gray">{t("mf.create.autoHint")}</Text>
        </View>
        {f.auto ? <Icon name="check" size={16} color={c.accent} /> : null}
      </PressableScale>
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

const s = StyleSheet.create({
  col: { gap: 10 },
  auto: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, borderWidth: 1.5 },
  autoIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, gap: 2 },
});
