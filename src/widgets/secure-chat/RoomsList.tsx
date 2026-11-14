import { useTabHeader } from "@/widgets/tab-page";
import { useMemo, useState, type ReactElement } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { CircleX, Lock, Search, SlidersHorizontal } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import type { UseQueryResult } from "@tanstack/react-query";
import { Chip, EmptyState, ErrorView, PressableScale, Skeleton, Text } from "@/shared/ui";
import { fonts, radius, useColors } from "@/shared/theme";
import { RoomRow, ROOM_AVATAR, byActivity, type Room } from "@/entities/secure-chat";
import { useT } from "@/shared/i18n";
import { InboxFilterSheet } from "./InboxFilterSheet";
import { filterRooms, kindOptions, type InboxKind } from "./inbox";

type Props = { query: UseQueryResult<Room[]>; rooms: Room[]; myId: string; bottom: number; onOpen: (r: Room) => void; header?: ReactElement | null; action?: { label: string; onPress: () => void }; tagOf?: (r: Room) => string; showRole?: boolean };

// eslint-disable-next-line @typescript-eslint/no-require-imports -- bundled asset (metro assetExts: lottie)
const NO_MESS = require("../../../assets/lottie/noMess.lottie") as string;

// The inbox: search, kind chips, newest conversation first as the rows of one white card, pull to refresh, skeleton / error / empty states.
export function RoomsList({ query, rooms, myId, bottom, onOpen, header, action, tagOf, showRole = true }: Props) {
  const top = useTabHeader(16);
  const { t } = useT();
  const c = useColors();
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
    : <EmptyState lottie={NO_MESS} title={t("admChat.empty")} text={t("admChat.emptyText")} actionLabel={action?.label} onAction={action?.onPress} />;
  return (
    <>
    <FlashList // hundreds of rooms for a lawyer: rows are recycled
      data={query.isLoading ? [] : rows}
      keyExtractor={(r) => r.id}
      renderItem={({ item, index }) => (
        <View style={[s.cell, { backgroundColor: c.surface, borderColor: c.line }, index === 0 ? s.first : null, index === rows.length - 1 ? s.last : s.inner]}>
          <RoomRow room={item} myId={myId} onPress={() => onOpen(item)} tag={tagOf?.(item)} showRole={showRole} />
        </View>
      )}
      ListHeaderComponent={<View>{top}<View style={{ gap: 10, marginBottom: 12 }}>{header}<View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><Lock size={14} color={c.gray} /><Text variant="caption" tone="gray" style={{ flex: 1 }}>{t("ms1.lead")}</Text></View>{rooms.length > 0 ? <View style={{ gap: 10 }}><View style={s.tools}><View style={[s.search, { backgroundColor: c.surface, borderColor: c.line }]}><Search size={16} color={c.gray} /><TextInput value={search} onChangeText={setSearch} placeholder={t("admChat.search")} placeholderTextColor={c.gray2} autoCapitalize="none" autoCorrect={false} returnKeyType="search" accessibilityLabel={t("admChat.search")} style={[s.input, { color: c.ink }]} />{search ? <PressableScale onPress={() => setSearch("")} hitSlop={10} accessibilityRole="button"><CircleX size={16} color={c.gray} /></PressableScale> : null}</View><PressableScale onPress={() => setSheet(true)} scale={0.95} accessibilityRole="button" accessibilityLabel={t("dm11.filters")} style={[s.filter, { backgroundColor: c.surface, borderColor: c.line }]}><SlidersHorizontal size={18} color={c.ink} />{kind !== "all" ? <View style={[s.dot, { backgroundColor: c.accent }]} /> : null}</PressableScale></View>{kind !== "all" ? <View style={{ flexDirection: "row" }}><Chip label={options.find((o) => o.value === kind)?.label ?? kind} active icon="x" onPress={() => setKind("all")} /></View> : null}</View> : null}</View></View>}
      ListEmptyComponent={empty}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom, flexGrow: 1 }}
      refreshing={pulling}
      onRefresh={() => { setPulling(true); void query.refetch().finally(() => setPulling(false)); }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      maintainVisibleContentPosition={{ disabled: true }} // a room with a new message moves to the top and is seen there
    />
    <InboxFilterSheet visible={sheet} onClose={() => setSheet(false)} options={options} value={kind} onChange={setKind} total={rows.length} />
    </>
  );
}

const s = StyleSheet.create({
  cell: { borderLeftWidth: 1, borderRightWidth: 1 },
  first: { borderTopWidth: 1, borderTopLeftRadius: radius.rl, borderTopRightRadius: radius.rl },
  last: { borderBottomWidth: 1, borderBottomLeftRadius: radius.rl, borderBottomRightRadius: radius.rl },
  inner: { borderBottomWidth: 1 },
  tools: { flexDirection: "row", alignItems: "center", gap: 8 },
  search: { flex: 1, minWidth: 0, height: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
  input: { flex: 1, minWidth: 0, fontFamily: fonts.body, fontSize: 14, paddingVertical: 0 },
  filter: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 9, right: 9, width: 8, height: 8, borderRadius: 4 },
});
