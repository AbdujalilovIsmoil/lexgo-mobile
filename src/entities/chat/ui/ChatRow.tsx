import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDate, fmtTime } from "@/shared/lib/format";
import { isToday } from "../lib/groupChats";
import { plainText } from "../lib/plainText";
import type { Chat } from "../model/types";

type Props = { chat: Chat; active?: boolean; onPress: () => void };

// One past conversation in the history list: title, last message preview, time.
export function ChatRow({ chat, active, onPress }: Props) {
  const c = useColors();
  const { t, locale } = useT();
  const at = chat.updatedAt;
  const stamp = !at ? "" : isToday(at) ? fmtTime(at) : fmtDate(at, locale);
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" style={[s.row, { backgroundColor: c.surface, borderColor: active ? c.accent : c.line }]}>
      <View style={[s.icon, { backgroundColor: c.tint2 }]}><Icon name="message-circle" size={18} color={c.accent} /></View>
      <View style={s.col}>
        <Text variant="small" weight="semibold" numberOfLines={1}>{chat.title || t("ax1.untitled")}</Text>
        {chat.lastMessage ? <Text variant="caption" tone="gray" numberOfLines={2}>{plainText(chat.lastMessage)}</Text> : null}
      </View>
      {stamp ? <Text variant="caption" tone="gray2">{stamp}</Text> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, borderWidth: 1 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
});
