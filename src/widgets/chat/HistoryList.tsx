import { useMemo } from "react";
import { SectionList, StyleSheet } from "react-native";
import { ChatRow, type Chat, type ChatGroup } from "@/entities/chat";
import { EmptyState, ErrorView, ListRowSkeleton, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import type { ReactElement } from "react";

type Props = {
  groups: ChatGroup[];
  activeId: string | null;
  loading: boolean;
  error: unknown;
  refreshing: boolean;
  searching: boolean;
  onRefresh: () => void;
  onOpen: (chat: Chat) => void;
  header: ReactElement;
};

// Past conversations by day. Pull to refresh; skeleton / empty / no-match / error states.
export function HistoryList({ groups, activeId, loading, error, refreshing, searching, onRefresh, onOpen, header }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const sections = useMemo(() => groups.map((g) => ({ key: g.key, data: g.items })), [groups]);
  const body = error ? (
    <ErrorView error={error} onRetry={onRefresh} />
  ) : loading ? (
    <ListRowSkeleton rows={6} />
  ) : (
    <EmptyState icon={searching ? "search" : "message-circle"} title={t(searching ? "ax1.noMatch" : "ai.historyEmpty")} text={searching ? undefined : t("ax1.historyEmptyText")} />
  );
  return (
    <SectionList
      sections={sections}
      keyExtractor={(c) => c.id}
      renderItem={({ item }) => <ChatRow chat={item} active={item.id === activeId} onPress={() => onOpen(item)} />}
      renderSectionHeader={({ section }) => <Text variant="kicker" tone="gray" style={s.head}>{t(`ax1.group.${section.key}`)}</Text>}
      ListHeaderComponent={header}
      ListEmptyComponent={body}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 24 }]}
      refreshing={refreshing}
      onRefresh={onRefresh}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 8 },
  head: { marginTop: 12, marginBottom: 6, textTransform: "uppercase" },
});
