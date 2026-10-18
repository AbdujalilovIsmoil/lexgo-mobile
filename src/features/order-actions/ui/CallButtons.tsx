import { StyleSheet, View } from "react-native";
import type { MarketOrder } from "@/entities/order";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useOrderCall } from "../model/useOrderCall";

// Audio / video call to the seller, offered by the server (can_create_call) while the order is open.
export function CallButtons({ order }: { order: MarketOrder }) {
  const { t } = useT();
  const { calling, call } = useOrderCall(order);
  return (
    <View style={s.row}>
      <Button title={calling === "audio" ? t("mk7.calling") : t("mk7.audio")} onPress={() => void call("audio")} disabled={!!calling} variant="soft" icon="phone" style={s.half} />
      <Button title={calling === "video" ? t("mk7.calling") : t("mk7.video")} onPress={() => void call("video")} disabled={!!calling} variant="soft" icon="video" style={s.half} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
});
