import { StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAiTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import type { Chat } from "@/entities/chat";
import { useAiChat, useChatHistory } from "@/features/ai-chat";
import { HistoryList } from "@/widgets/chat";
import { FocusStatusBar, Icon, PressableScale, Text, backIcon, singleLineText } from "@/shared/ui";

// Previous AI conversations (newest activity first, grouped by day, searchable), in the AI screen's own light or dark look; a tap
// reopens one in the AI tab, the pen starts a new one.
export function ChatsHistoryPage() {
  const ai = useAiTheme();
  const { t } = useT();
  const insets = useInsets();
  const router = useRouter();
  const chat = useAiChat();
  const h = useChatHistory();
  const openChat = async (item: Chat) => {
    await chat.open(item.id).catch(() => undefined);
    router.navigate("/ai");
  };
  const fresh = () => {
    chat.newChat();
    router.navigate("/ai");
  };
  const ground = ai.dark ? (["#11224F", "#0B1634", "#090E1B"] as const) : ([ai.bg, ai.bg] as const);
  return (
    <View style={s.fill}>
      <FocusStatusBar style={ai.dark ? "light" : "dark"} />
      <LinearGradient colors={ground} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[s.bar, { paddingTop: insets.top + 6, borderBottomColor: ai.border }]}>
        <PressableScale onPress={() => router.back()} hitSlop={10} style={s.btn} accessibilityRole="button" accessibilityLabel={t("common.back")}>
          <Icon name={backIcon} size={24} color={ai.text} />
        </PressableScale>
        <Text variant="h3" numberOfLines={1} style={[s.title, { color: ai.text }]}>{t("ai.history")}</Text>
        <PressableScale onPress={fresh} hitSlop={10} style={s.btn} accessibilityRole="button" accessibilityLabel={t("ai.newChat")}>
          <Icon name="edit-2" size={21} color={ai.text} />
        </PressableScale>
      </View>
      <HistoryList
        groups={h.groups}
        activeId={chat.chatId}
        loading={h.query.isLoading}
        error={h.query.error}
        refreshing={h.query.isRefetching}
        searching={h.searching}
        onRefresh={() => void h.query.refetch()}
        onOpen={(item) => void openChat(item)}
        header={
          <View style={[s.search, { backgroundColor: ai.dark ? "rgba(96,134,232,0.16)" : ai.card, borderColor: ai.border }]}>
            <Icon name="search" size={19} color={ai.muted} />
            <TextInput value={h.q} onChangeText={h.setQ} placeholder={t("ax1.search")} placeholderTextColor={ai.dark ? "#B9C6DD" : ai.muted} selectionColor={ai.accent} returnKeyType="search" style={[s.input, { color: ai.text }, singleLineText]} accessibilityLabel={t("ax1.search")} />
            {h.q ? <PressableScale onPress={() => h.setQ("")} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("dcat.clearSearch")}><Icon name="x" size={17} color={ai.muted} /></PressableScale> : null}
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  bar: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  btn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, fontSize: 21 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, minHeight: 54 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
});
