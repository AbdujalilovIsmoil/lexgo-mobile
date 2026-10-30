import { useMemo } from "react";
import { SectionList, StyleSheet } from "react-native";
import { ChatRow, type Chat, type ChatGroup, type ChatGroupKey } from "@/entities/chat";
import { EmptyState, ErrorView, ListRowSkeleton, Text } from "@/shared/ui";
import { useAiTheme } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { fmtTime } from "@/shared/lib/format";
import { weekdayShort } from "@/shared/lib/calendarNames";
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

const pad = (n: number) => String(n).padStart(2, "0");

// Past conversations by day, each day one card of rows. The stamp says what the day heading does not: the time today, "Kecha", the
// weekday this week, the date before. Pull to refresh; skeleton / empty / no-match / error states.
export function HistoryList({ groups, activeId, loading, error, refreshing, searching, onRefresh, onOpen, header }: Props) {
  const { t, locale } = useT();
  const ai = useAiTheme();
  const insets = useInsets();
  const sections = useMemo(() => groups.map((g) => ({ key: g.key, data: g.items })), [groups]);
  const stamp = (key: ChatGroupKey, iso?: string) => {
    const d = new Date(iso ?? "");
    if (Number.isNaN(d.getTime())) return "";
    if (key === "today") return fmtTime(iso);
    if (key === "yesterday") return t("ax1.group.yesterday");
    if (key === "week") return weekdayShort(d.getDay() || 7, locale);
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
  };
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
      renderItem={({ item, index, section }) => (
        <ChatRow chat={item} stamp={stamp(section.key, item.updatedAt)} active={item.id === activeId} first={index === 0} last={index === section.data.length - 1} onPress={() => onOpen(item)} />
      )}
      renderSectionHeader={({ section }) => <Text variant="kicker" style={[s.head, { color: ai.dark ? "#C9D3E6" : ai.muted }]}>{t(`ax1.group.${section.key}`)}</Text>}
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
  content: { paddingHorizontal: 16 },
  head: { marginTop: 22, marginBottom: 10, marginLeft: 2, textTransform: "uppercase" },
});
