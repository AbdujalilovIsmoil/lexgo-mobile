import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, LiveDot, PressableScale, Text } from "@/shared/ui";
import type { Invited } from "@/entities/call";
import { fmtTime } from "@/shared/lib/format";
import { radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { JoinButton } from "./JoinButton";

// A meeting that is running right now: a green card with a pulsing light, the title, who hosts it and one big Join button.
export function LiveCard({ item, mine, onJoin, onOpen }: { item: Invited; mine: boolean; onJoin: () => void; onOpen: () => void }) {
  const { t } = useT();
  const title = item.title || t("admMeet.untitled");
  const host = mine ? t("meetUx.you") : item.callerName || t("admMeet.someone");
  const range = `${fmtTime(item.startedAt)}${item.autoEndAt ? ` – ${fmtTime(item.autoEndAt)}` : ""}`;
  return (
    <LinearGradient colors={["#0E7A4F", "#16A34A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <PressableScale onPress={onOpen} scale={0.99} accessibilityRole="button" accessibilityLabel={`${t("ms7.live")}: ${title}, ${range}`} style={s.top}>
        <View style={s.head}>
          <LiveDot color="#FFFFFF" size={9} />
          <Text variant="small" weight="bold" tone="white" style={s.grow}>{t("ms7.live")}</Text>
          <Text variant="small" style={s.sub}>{range}</Text>
        </View>
        <Text variant="h3" tone="white" numberOfLines={2}>{title}</Text>
        <View style={s.host}>
          <Avatar name={host} size={24} />
          <Text variant="small" style={s.sub} numberOfLines={1}>{host}</Text>
        </View>
      </PressableScale>
      <JoinButton big onGreen icon={item.type === "audio" ? "mic" : "video"} label={t(mine || item.status === "joined" ? "admMeet.rejoin" : "admMeet.join")} onPress={onJoin} />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.rx, padding: 16, gap: 14 },
  top: { gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 6 },
  grow: { flex: 1 },
  host: { flexDirection: "row", alignItems: "center", gap: 8 },
  sub: { color: "#D1FAE5", flexShrink: 1 },
});
