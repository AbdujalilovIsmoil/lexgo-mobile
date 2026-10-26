import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Button, Icon, Text } from "@/shared/ui";
import { isLive, useRoomCalls } from "@/entities/call";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";

// "A call is running in this chat" with a Join button — shown to everyone who can see the room (the chat header, and the order screens:
// TZ §2 restores a running call from the order).
export function ActiveCallBar({ roomId, onJoin, style }: { roomId: string; onJoin: (callId: string) => void; style?: StyleProp<ViewStyle> }) {
  const { t } = useT();
  const c = useColors();
  const live = useRoomCalls(roomId).data?.find((call) => isLive(call.status));
  if (!live) return null;
  return (
    <View style={[s.bar, { backgroundColor: c.okBg }, style]}>
      <Icon name={live.type === "audio" ? "phone-call" : "video"} size={18} color={c.ok} />
      <Text variant="small" weight="bold" style={[s.text, { color: c.ok }]} numberOfLines={1}>{live.title || t("admChat.callRunning")}</Text>
      <Button title={t("admChat.join")} size="sm" variant="primary" onPress={() => onJoin(live.id)} />
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 14 },
  text: { flex: 1 },
});
