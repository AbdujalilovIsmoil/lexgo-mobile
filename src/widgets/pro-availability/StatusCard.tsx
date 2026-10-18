import { StyleSheet, View } from "react-native";
import { useSocketState } from "@/shared/realtime";
import { radius, useColors } from "@/shared/theme";
import { Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { StatusText } from "./useStatusText";

// The first thing on the screen: how clients see the seller at this moment, with a coloured dot.
// The app's own realtime connection sits in a quiet line below.
export function StatusCard({ status }: { status: StatusText }) {
  const { t } = useT();
  const c = useColors();
  const socket = useSocketState();
  const dot = status.state === "online" ? c.ok : status.state === "paused" ? c.warn : c.gray2;
  return (
    <Card style={s.card} accessible accessibilityLabel={`${t("availUx.now")}. ${status.title}. ${status.sub}`}>
      <Text variant="caption" tone="gray">{t("availUx.now")}</Text>
      <View style={s.row}>
        <View style={[s.halo, { backgroundColor: status.state === "online" ? c.okBg : c.surface2 }]}>
          <View style={[s.dot, { backgroundColor: dot }]} />
        </View>
        <View style={s.col}>
          <Text variant="h3">{status.title}</Text>
          <Text variant="small" tone="gray">{status.sub}</Text>
        </View>
      </View>
      <View style={s.conn}>
        <View style={[s.mini, { backgroundColor: socket === "online" ? c.ok : c.gray2 }]} />
        <Text variant="caption" tone="gray2">{t(`sl8.socket.${socket}`)}</Text>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  halo: { width: 44, height: 44, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  dot: { width: 16, height: 16, borderRadius: 8 },
  col: { flex: 1, gap: 2 },
  conn: { flexDirection: "row", alignItems: "center", gap: 6 },
  mini: { width: 7, height: 7, borderRadius: 4 },
});
