import { useEffect, useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { newInstructorChat, useInstructorChat, type InstructorMsg } from "@/features/instructor";
import { Bubble } from "./Bubbles";
import { InstructorComposer } from "./InstructorComposer";
import { Welcome } from "./Welcome";

// Messages (or the welcome card) above, the composer below. Sticks to the newest message.
export function ChatView() {
  const { t } = useT();
  const { messages, sending } = useInstructorChat();
  const ref = useRef<FlatList<InstructorMsg>>(null);
  useEffect(() => {
    const id = setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(id);
  }, [messages.length, sending]);
  return (
    <View style={s.fill}>
      <FlatList
        ref={ref}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item, index }) => <Bubble msg={item} last={index === messages.length - 1} />}
        ListHeaderComponent={messages.length ? <View style={s.head}><Button title={t("ax2.newChat")} icon="edit-3" variant="ghost" size="sm" onPress={newInstructorChat} /></View> : <Welcome />}
        ListFooterComponent={sending ? <View style={s.typing}><Skeleton width={150} height={14} /><Text variant="caption" tone="gray2">{t("ax2.thinking")}</Text></View> : null}
        contentContainerStyle={[s.list, !messages.length && s.center]}
        ItemSeparatorComponent={() => <View style={s.gap} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      />
      <InstructorComposer busy={sending} />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  list: { padding: 16, paddingBottom: 8 },
  center: { flexGrow: 1, justifyContent: "center" }, // the welcome card sits in the middle of the screen, whatever the role
  gap: { height: 12 },
  typing: { gap: 6, marginTop: 12 },
  head: { alignItems: "flex-end", marginBottom: 6 },
});
