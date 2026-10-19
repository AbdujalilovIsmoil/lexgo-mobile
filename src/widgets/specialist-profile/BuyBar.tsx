import { StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { LawyerService } from "@/entities/lawyer";

type Props = { service: LawyerService | null; fallback: number; canChat: boolean; chatBusy: boolean; onChat: () => void; onBuy: () => void };

// The web's purchase card as a bar that stays put: the picked service, its price in so'm, a round chat button (only while a paid order with this specialist is running) and the
// gradient "Sotib olish" (never dead: with nothing to buy it becomes "Xizmat tanlash", see SpecialistView).
export function BuyBar({ service, fallback, canChat, chatBusy, onChat, onBuy }: Props) {
  const c = useColors();
  const { t } = useT();
  const insets = useInsets();
  const price = service?.price || fallback;
  return (
    <View style={[s.bar, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom + 12 }]}>
      <View style={s.price}>
        <Text variant="caption" tone="gray" numberOfLines={1}>{service?.title ?? t("mkd.selectService")}</Text>
        <Text variant="h4" tone="accent" numberOfLines={1}>{price ? `${fmtMoney(price)} ${t("common.currency")}` : "—"}</Text>
      </View>
      {canChat ? <IconButton icon="message-circle" size={48} label={t("spf.chat")} onPress={onChat} badge={chatBusy} /> : null}
      <Button title={t(service?.price ? "mkd.buy" : "spf.pick")} icon="arrow-right" iconRight variant="gradient" onPress={onBuy} />
    </View>
  );
}

const s = StyleSheet.create({
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  price: { flex: 1, minWidth: 80 },
});
