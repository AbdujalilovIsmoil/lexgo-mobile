import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { Lawyer } from "../model/types";

// Card footer: live availability + display id on the left, "from" price on the right.
export function LawyerCardFooter({ lawyer }: { lawyer: Lawyer }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={[s.foot, { borderTopColor: c.line }]}>
      <View style={s.left}>
        <View style={s.avail}>
          <View style={[s.dot, { backgroundColor: lawyer.available ? c.ok : c.gray2 }]} />
          <Text variant="small" weight="bold">{t(lawyer.available ? "mk1.avail" : "mk1.busy")}</Text>
        </View>
        {lawyer.publicId ? <Text variant="caption" tone="gray2" numberOfLines={1}>{lawyer.publicId}</Text> : null}
      </View>
      <View style={s.price}>
        {lawyer.basePrice ? (
          <>
            <Text variant="h4" tone="accent">{fmtMoney(lawyer.basePrice)}</Text>
            <Text variant="caption" tone="gray2">{t("lawyers.card.priceNote")}</Text>
          </>
        ) : (
          <Text variant="small" tone="gray2" weight="semibold">{t("services.priceOnRequest")}</Text>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  foot: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderTopWidth: 1, paddingTop: 12, gap: 10 },
  left: { flex: 1, gap: 2 },
  avail: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  price: { alignItems: "flex-end" },
});
