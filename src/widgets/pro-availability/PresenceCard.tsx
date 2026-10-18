import { StyleSheet, View } from "react-native";
import { useSocketState } from "@/shared/realtime";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { pub: { onlineNow: boolean; available: boolean } | null | undefined; loading: boolean };

// Read-only status: the app's realtime connection and how the marketplace currently shows this seller.
export function PresenceCard({ pub, loading }: Props) {
  const { t } = useT();
  const c = useColors();
  const socket = useSocketState();
  const online = pub ? pub.onlineNow && pub.available : false;
  const row = (on: boolean, title: string, sub: string) => (
    <View style={s.row}>
      <View style={[s.dot, { backgroundColor: on ? c.ok : c.gray2 }]} />
      <View style={s.col}>
        <Text variant="small" weight="semibold">{title}</Text>
        <Text variant="caption" tone="gray">{sub}</Text>
      </View>
    </View>
  );
  return (
    <SectionCard title={t("sl8.presence")}>
      {row(socket === "online", t("sl8.connection"), t(`sl8.socket.${socket}`))}
      {loading ? null : row(online, t("sl8.marketStatus"), pub ? t(online ? "sl8.market.online" : "sl8.market.offline") : t("sl8.market.hidden"))}
      <Text variant="caption" tone="gray2">{t("sl8.presenceHint")}</Text>
    </SectionCard>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", gap: 10, alignItems: "center" }, col: { flex: 1, gap: 1 }, dot: { width: 10, height: 10, borderRadius: 5 } });
