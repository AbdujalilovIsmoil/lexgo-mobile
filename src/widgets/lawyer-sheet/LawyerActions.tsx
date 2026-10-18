import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import type { Lawyer } from "@/entities/lawyer";
import { Button, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// Always-visible bottom bar: the starting price and the "Choose" action.
export function LawyerActions({ lawyer, onChoose }: { lawyer: Lawyer; onChoose: () => void }) {
  const c = useColors();
  const { t } = useT();
  const insets = useInsets();
  return (
    <View style={[s.bar, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom + 12 }]}>
      <View style={s.price}>
        <Text variant="h3" tone="accent">{lawyer.basePrice ? fmtMoney(lawyer.basePrice) : "—"}</Text>
        <Text variant="caption" tone="gray2">{t("lw.priceNote")}</Text>
      </View>
      <Button title={t("lw.choose")} onPress={onChoose} variant="gradient" icon="arrow-right" iconRight />
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  price: { flex: 1 },
});
