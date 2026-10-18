import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { BottomSheet, Icon, Input, PressableScale, Text } from "@/shared/ui";
import type { ChatMsg } from "@/features/call/call";
import { fmtTime } from "@/shared/lib/format";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";

type Props = { visible: boolean; onClose: () => void; msgs: ChatMsg[]; nameOf: (id: string) => string; onSend: (text: string) => void };

// Chat inside the meeting (LiveKit data channel — it is not stored on the server).
export function CallChatSheet({ visible, onClose, msgs, nameOf, onSend }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const [text, setText] = useState("");
  const scroll = useRef<ScrollView>(null);
  const send = () => { onSend(text); setText(""); };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("admMeet.chat")} subtitle={t("admMeet.chatNote")} snaps={[0.6, 0.92]}>
      <ScrollView ref={scroll} style={s.fill} contentContainerStyle={s.list} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled">
        {msgs.length === 0 ? <Text variant="small" tone="gray" center>{t("admMeet.chatEmpty")}</Text> : null}
        {msgs.map((m) => (
          <View key={m.id} style={[s.msg, m.mine && s.mine]}>
            <View style={[s.bubble, { backgroundColor: m.mine ? c.accent : c.surface2 }]}>
              {m.mine ? null : <Text variant="caption" weight="bold" tone="accent">{nameOf(m.from)}</Text>}
              <Text variant="body" style={{ color: m.mine ? "#FFFFFF" : c.ink }}>{m.text}</Text>
              <Text variant="caption" style={{ color: m.mine ? "#FFFFFF" : c.gray, opacity: 0.7, alignSelf: "flex-end" }}>{fmtTime(new Date(m.at).toISOString())}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={[s.bar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={s.fill}><Input value={text} onChangeText={setText} placeholder={t("admMeet.chatPh")} returnKeyType="send" onSubmitEditing={send} /></View>
        <PressableScale onPress={send} style={[s.send, { backgroundColor: text.trim() ? c.accent : c.surface2 }]}><Icon name="send" size={20} color={text.trim() ? "#FFFFFF" : c.gray2} /></PressableScale>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  list: { padding: 18, gap: 8 },
  msg: { flexDirection: "row" },
  mine: { justifyContent: "flex-end" },
  bubble: { maxWidth: "82%", borderRadius: 16, paddingVertical: 7, paddingHorizontal: 12, gap: 1 },
  bar: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
});
