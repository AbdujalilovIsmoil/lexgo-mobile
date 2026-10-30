import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useAiTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { plainText } from "../lib/plainText";
import type { Chat } from "../model/types";

type Props = { chat: Chat; stamp: string; active?: boolean; first: boolean; last: boolean; onPress: () => void };

// One past conversation as a row of its day's card: the chat mark, the title with the time (or day) at the right, two lines of the last
// message. `first` / `last` round the card's corners and close its edges; the open conversation is outlined in the accent colour.
export function ChatRow({ chat, stamp, active, first, last, onPress }: Props) {
  const ai = useAiTheme();
  const { t } = useT();
  const card = ai.dark ? "rgba(96,134,232,0.13)" : ai.card;
  return (
    <PressableScale
      onPress={onPress}
      scale={0.99}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[
        s.row,
        { backgroundColor: card, borderColor: ai.border },
        first && s.first,
        last && s.last,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth },
        active && { borderColor: "#5FD9FF", borderWidth: 1.5, borderBottomWidth: 1.5 },
      ]}
    >
      <View style={[s.icon, { backgroundColor: ai.dark ? "rgba(255,255,255,0.10)" : ai.glassStrong }]}><Icon name="message-circle" size={18} color={ai.dark ? "#FFFFFF" : ai.accent} /></View>
      <View style={s.col}>
        <View style={s.top}>
          <Text variant="body" weight="bold" numberOfLines={1} style={[s.flex, { color: ai.text }]}>{chat.title || t("ax1.untitled")}</Text>
          {stamp ? <Text variant="small" style={{ color: ai.muted }}>{stamp}</Text> : null}
        </View>
        {chat.lastMessage ? <Text variant="small" numberOfLines={2} style={{ color: ai.dark ? "#C9D3E6" : ai.muted }}>{plainText(chat.lastMessage)}</Text> : null}
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderLeftWidth: 1, borderRightWidth: 1 },
  first: { borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  last: { borderBottomWidth: 1, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 3 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
});
