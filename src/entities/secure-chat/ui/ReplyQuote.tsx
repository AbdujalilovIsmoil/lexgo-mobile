import { StyleSheet, View } from "react-native";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { previewText } from "../model/preview";
import type { Reply } from "../model/types";

// The quoted message above a reply (and in the composer's reply strip); tapping it jumps to the original.
export function ReplyQuote({ reply, mine, onPress }: { reply: Reply; mine?: boolean; onPress?: () => void }) {
  const { t } = useT();
  const c = useColors();
  const fg = mine ? "rgba(255,255,255,0.85)" : c.gray;
  return (
    <PressableScale onPress={onPress} disabled={!onPress} scale={0.98} haptic={false} style={[s.box, { borderLeftColor: mine ? "#FFFFFF" : c.accent, backgroundColor: mine ? "rgba(255,255,255,0.16)" : c.tint2 }]}>
      <View>
        <Text variant="caption" weight="bold" style={{ color: mine ? "#FFFFFF" : c.accent }} numberOfLines={1}>{reply.sender?.name || t("admChat.someone")}</Text>
        <Text variant="caption" style={{ color: fg }} numberOfLines={2}>{previewText(reply, t)}</Text>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({ box: { borderLeftWidth: 3, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8, marginBottom: 6 } });
