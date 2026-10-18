import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { fmtTime } from "@/shared/lib/format";
import type { Msg } from "../model/types";

// "A call started" card (messages of type meeting / call); tap to join it.
export function CallNote({ msg, callId, live, onJoin }: { msg: Msg; callId: string; live: boolean; onJoin: (callId: string) => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <PressableScale onPress={callId && live ? () => onJoin(callId) : undefined} style={[s.card, { backgroundColor: c.tint2, borderColor: c.line }]}>
      <View style={[s.icon, { backgroundColor: c.accent }]}><Icon name="video" size={18} color="#FFFFFF" /></View>
      <View style={s.col}>
        <Text variant="small" weight="bold">{t("admChat.callStarted")}</Text>
        <Text variant="caption" tone="gray">{msg.sender?.name ? `${msg.sender.name} · ` : ""}{fmtTime(msg.createdAt)}</Text>
      </View>
      {callId ? <Text variant="small" weight="bold" tone={live ? "accent" : "gray"}>{live ? t("admChat.join") : t("ms4.callEnded")}</Text> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, alignSelf: "center", width: "90%", borderRadius: 16, borderWidth: 1, padding: 14, marginVertical: 8 },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  col: { flex: 1 },
});
