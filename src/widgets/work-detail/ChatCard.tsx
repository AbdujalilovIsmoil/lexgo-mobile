import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { gradient, radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { WorkPerson } from "@/entities/work";

type Props = { person: WorkPerson | null; onChat: () => void; onCall?: () => void };

// The way into the conversation as one card instead of two buttons: a chat tile and the specialist's name on the brand gradient,
// "Chatni ochish" as the whole card's tap target (arrow on the right), and — when a call is live — a round "join" button beside it.
export function ChatCard({ person, onChat, onCall }: Props) {
  const { t } = useT();
  return (
    <View style={s.row}>
      <PressableScale onPress={onChat} accessibilityRole="button" accessibilityLabel={t("cl4.chat")} style={s.flex}>
        <LinearGradient colors={[...gradient.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
          <View style={s.glow} pointerEvents="none" />
          <View style={s.ico}><Icon name="message-circle" size={22} color="#FFFFFF" /></View>
          <View style={s.flex}>
            <Text variant="body" weight="bold" tone="white" numberOfLines={1}>{t("cl4.chat")}</Text>
            {person ? <Text variant="caption" numberOfLines={1} style={s.sub}>{person.name}</Text> : null}
          </View>
          <View style={s.go}><Icon name="arrow-right" size={18} color="#FFFFFF" /></View>
        </LinearGradient>
      </PressableScale>
      {onCall ? (
        <PressableScale onPress={onCall} accessibilityRole="button" accessibilityLabel={t("cl4.joinCall")} style={s.call}>
          <Icon name="video" size={22} color="#FFFFFF" />
        </PressableScale>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "stretch", gap: 10 },
  flex: { flex: 1 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68, padding: 12, borderRadius: radius.rl, overflow: "hidden" },
  glow: { position: "absolute", top: -40, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.14)" },
  ico: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  sub: { color: "rgba(255,255,255,0.8)" },
  go: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  call: { width: 68, borderRadius: radius.rl, backgroundColor: "#0E5FC4", alignItems: "center", justifyContent: "center" },
});
