import { useTabHeader } from "@/widgets/tab-page";
import { useMemo, useState, type ReactElement } from "react";
import { FlatList, View } from "react-native";
import type { UseQueryResult } from "@tanstack/react-query";
import { Chip, Divider, EmptyState, ErrorView, Icon, IconButton, Skeleton, Text } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { RoomRow, ROOM_AVATAR, byActivity, type Room } from "@/entities/secure-chat";
import { useT } from "@/shared/i18n";
import { InboxFilterSheet } from "./InboxFilterSheet";
import { filterRooms, kindOptions, type InboxKind } from "./inbox";

type Props = { query: UseQueryResult<Room[]>; rooms: Room[]; myId: string; bottom: number; onOpen: (r: Room) => void; header?: ReactElement | null; action?: { label: string; onPress: () => void }; tagOf?: (r: Room) => string };

// The inbox, Telegram-style: search, kind chips, newest conversation first as flat rows split by hairlines, pull to refresh, skeleton / error / empty states.
export function RoomsList({ query, rooms, myId, bottom, onOpen, header, action, tagOf }: Props) {
  const top = useTabHeader(16);
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<InboxKind>("all");
  const [sheet, setSheet] = useState(false);
  const [pulling, setPulling] = useState(false);
  const sorted = useMemo(() => [...rooms].sort(byActivity), [rooms]);
  const rows = useMemo(() => filterRooms(sorted, myId, search, kind, t, tagOf), [sorted, myId, search, kind, t, tagOf]);
  const options = useMemo(() => kindOptions(sorted, t, kind), [sorted, t, kind]);
  const empty = query.isLoading ? <View style={{ gap: 18, paddingTop: 8 }}>{[0, 1, 2, 3, 4, 5].map((i) => <View key={i} style={{ flexDirection: "row", gap: 14, alignItems: "center" }}><Skeleton width={ROOM_AVATAR} height={ROOM_AVATAR} round={ROOM_AVATAR / 2} /><View style={{ flex: 1, gap: 8 }}><Skeleton width="55%" height={14} /><Skeleton width="85%" height={12} /></View></View>)}</View>
    : query.isError && !rooms.length ? <ErrorView error={query.error} onRetry={() => void query.refetch()} />
    : rooms.length ? <EmptyState icon="search" title={t("ms1.noMatch")} text={t("ms1.noMatchText")} />
    : <EmptyState icon="message-circle" title={t("admChat.empty")} text={t("admChat.emptyText")} actionLabel={action?.label} onAction={action?.onPress} />;
  return (
    <>
    <FlatList
      data={query.isLoading ? [] : rows}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => <RoomRow room={item} myId={myId} onPress={() => onOpen(item)} tag={tagOf?.(item)} />}
      ListHeaderComponent={<View>{top}<View style={{ gap: 10, marginBottom: 12 }}>{header}<View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><Icon name="lock" size={14} tone="gray" /><Text variant="caption" tone="gray" style={{ flex: 1 }}>{t("ms1.lead")}</Text></View>{rooms.length > 0 ? <View style={{ gap: 10, marginHorizontal: -16 }}><View style={{ flexDirection: "row", alignItems: "center", paddingRight: 16 }}><View style={{ flex: 1 }}><SearchBox value={search} onChangeText={setSearch} placeholder={t("admChat.search")} /></View><IconButton icon="sliders" label={t("dm11.filters")} badge={kind !== "all"} onPress={() => setSheet(true)} /></View>{kind !== "all" ? <View style={{ flexDirection: "row", paddingHorizontal: 16 }}><Chip label={options.find((o) => o.value === kind)?.label ?? kind} active icon="x" onPress={() => setKind("all")} /></View> : null}</View> : null}</View></View>}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={() => <Divider inset={ROOM_AVATAR + 14} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom, flexGrow: 1 }}
      refreshing={pulling}
      onRefresh={() => { setPulling(true); void query.refetch().finally(() => setPulling(false)); }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
    <InboxFilterSheet visible={sheet} onClose={() => setSheet(false)} options={options} value={kind} onChange={setKind} total={rows.length} />
    </>
  );
}
