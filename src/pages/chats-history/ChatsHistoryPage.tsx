import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { Chat } from "@/entities/chat";
import { useAiChat, useChatHistory } from "@/features/ai-chat";
import { HistoryList } from "@/widgets/chat";
import { Header, IconButton } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";

// Previous AI conversations (newest activity first, grouped by day, searchable); a tap reopens one in the AI tab.
export function ChatsHistoryPage() {
  const c = useColors();
  const { t } = useT();
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
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <Header title={t("ai.history")} right={<IconButton icon="edit-3" size={40} onPress={fresh} label={t("ai.newChat")} />} />
      <HistoryList
        groups={h.groups}
        activeId={chat.chatId}
        loading={h.query.isLoading}
        error={h.query.error}
        refreshing={h.query.isRefetching}
        searching={h.searching}
        onRefresh={() => void h.query.refetch()}
        onOpen={(item) => void openChat(item)}
        header={<View style={s.search}><SearchBox value={h.q} onChangeText={h.setQ} placeholder={t("ax1.search")} /></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  search: { marginHorizontal: -16, marginBottom: 4 },
});
