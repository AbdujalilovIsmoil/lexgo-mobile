import { StyleSheet, View } from "react-native";
import { Avatar, GradientBox, IconButton, Text } from "@/shared/ui";
import { radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";

type Props = { lawyerName: string; title: string; total: number; onClose?: () => void };

// The top of the checkout: who you are buying from and what (with a close button), then the gradient total card —
// the number the backend quoted, big, in so'm.
export function PurchaseHead({ lawyerName, title, total, onClose }: Props) {
  const { t } = useT();
  return (
    <View style={s.col}>
      <View style={s.who}>
        <Avatar name={lawyerName} size={44} />
        <View style={s.flex}>
          <Text variant="caption" tone="gray" numberOfLines={1}>{lawyerName}</Text>
          <Text variant="body" weight="bold" numberOfLines={2}>{title}</Text>
        </View>
        {onClose ? <IconButton icon="x" size={40} label={t("common.close")} onPress={onClose} /> : null}
      </View>
      <GradientBox round={radius.rl} style={s.total}>
        <View style={s.glow} pointerEvents="none" />
        <Text variant="caption" style={s.dim}>{t("mk3.title")}</Text>
        <View style={s.price}>
          <Text variant="hx" tone="white" numberOfLines={1} adjustsFontSizeToFit style={s.flex}>{fmtMoney(total)}</Text>
          <Text variant="body" weight="bold" style={s.dim}>{t("common.currency")}</Text>
        </View>
      </GradientBox>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 14 },
  who: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  total: { padding: 18, gap: 4 },
  glow: { position: "absolute", top: -50, right: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.14)" },
  price: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  dim: { color: "rgba(255,255,255,0.8)" },
});
