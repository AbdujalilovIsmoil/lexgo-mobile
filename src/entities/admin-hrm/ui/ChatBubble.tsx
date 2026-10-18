import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { fmtTime } from "@/shared/lib/format";
import type { Message } from "../model/typesWork";

// One chat bubble: mine on the right in the brand gradient, theirs on the left on a surface card; time under the text.
export const ChatBubble = memo(function ChatBubble({ item, mine }: { item: Message; mine: boolean }) {
  const c = useColors();
  const body = (
    <>
      {item.subject && item.subject !== item.body.slice(0, item.subject.length) ? <Text variant="small" weight="bold" style={{ color: mine ? "#fff" : c.ink }}>{item.subject}</Text> : null}
      <Text variant="body" selectable style={{ color: mine ? "#fff" : c.ink }}>{item.body}</Text>
      <Text variant="caption" style={[s.time, { color: mine ? "rgba(255,255,255,0.75)" : c.gray2 }]}>{fmtTime(item.createdAt)}</Text>
    </>
  );
  return (
    <View style={[s.row, mine ? s.right : s.left]}>
      {mine ? <LinearGradient colors={["#1668F0", "#00A6E6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.bubble, s.mine]}>{body}</LinearGradient>
        : <View style={[s.bubble, s.theirs, { backgroundColor: c.surface, borderColor: c.line }]}>{body}</View>}
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 14, marginVertical: 5 },
  right: { justifyContent: "flex-end" },
  left: { justifyContent: "flex-start" },
  bubble: { maxWidth: "82%", paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  mine: { borderRadius: 20, borderBottomRightRadius: 6 },
  theirs: { borderRadius: 20, borderBottomLeftRadius: 6, borderWidth: 1 },
  time: { alignSelf: "flex-end" },
});
