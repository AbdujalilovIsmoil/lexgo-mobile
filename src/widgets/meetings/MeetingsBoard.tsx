import { useState } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState, ErrorView, Segmented, Text } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { callPath, meetingPath, type Invited } from "@/entities/call";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { useMeetings } from "@/features/meeting";
import { useSellerActions } from "@/features/secure-chat";
import { useT } from "@/shared/i18n";
import { useTimeline } from "./lib/useTimeline";
import { phaseOf, shiftWeek } from "./lib/week";
import { CreateFab } from "./CreateFab";
import { CreateMeetingSheet } from "./CreateMeetingSheet";
import { LiveCard } from "./LiveCard";
import { MeetingRow } from "./MeetingRow";
import { MeetingsSkeleton } from "./MeetingsSkeleton";
import { MeetingsSummary } from "./MeetingsSummary";
import { WeekStrip } from "./WeekStrip";

type Tab = "upcoming" | "past";
const LONG_LIST = 8; // the search field only appears once there is enough to search through

// My meetings as an agenda: counts, what runs now (big Join), upcoming / past, a week strip to pick a day, the days with
// their meetings on a time rail, and a round "+" for a new meeting (when the account may start calls).
export function MeetingsBoard({ bottom }: { bottom: number }) {
  const { t } = useT();
  const router = useRouter();
  const myId = useSession()?.user.id ?? "";
  const sellerCalls = useSellerActions().calls;
  const canCreate = useAccess().canCalls && sellerCalls;
  const { q, upcoming, past } = useMeetings();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [search, setSearch] = useState("");
  const [day, setDay] = useState<string | null>(null);
  const [anchor, setAnchor] = useState(() => new Date());
  const [creating, setCreating] = useState(false);
  const [pulling, setPulling] = useState(false);
  const open = (m: Pick<Invited, "callId" | "roomId">) => router.push(meetingPath(m.callId, m.roomId) as never);
  const join = (m: Pick<Invited, "callId" | "roomId">) => router.push(callPath(m.roomId, m.callId) as never);
  const { live, sections, counts, shown, filtered } = useTimeline(tab === "upcoming" ? upcoming : past, search, day);
  const refresh = () => { setPulling(true); void q.refetch().finally(() => setPulling(false)); };
  const liveAll = upcoming.filter((m) => phaseOf(m, new Date()) === "live").length;
  const shift = (n: number) => { setAnchor((a) => shiftWeek(a, n)); setDay(null); };

  const empty = q.isLoading ? <MeetingsSkeleton />
    : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} />
    : live.length ? null
    : filtered ? <EmptyState compact icon="search" title={t("meetUx.searchNone")} text={t("meetUx.searchNoneText")} />
    : day ? <EmptyState compact icon="calendar" title={t("meetUx.dayNone")} text={t("meetUx.dayNoneText")} actionLabel={t("meetUx.allDays")} onAction={() => setDay(null)} />
    : tab === "upcoming" ? <EmptyState icon="video" title={t("ms7.emptyUp")} text={t(canCreate ? "meetUx.upText" : "meetUx.upTextGuest")} actionLabel={canCreate ? t("ms7.new") : undefined} onAction={() => setCreating(true)} />
    : <EmptyState icon="clock" title={t("ms7.emptyPast")} text={t("meetUx.pastText")} />;

  return (
    <View style={s.fill}>
      <SectionList
        sections={q.isLoading ? [] : sections}
        keyExtractor={(m) => m.callId}
        renderSectionHeader={({ section }) => (
          <View style={s.day}>
            <Text variant="h4" style={s.grow}>{section.title}</Text>
            <Text variant="small" tone="gray">{section.data.length}</Text>
          </View>
        )}
        renderItem={({ item, index, section }) => <MeetingRow item={item} myId={myId} phase={phaseOf(item, new Date())} first={index === 0} last={index === section.data.length - 1} onOpen={open} onJoin={join} />}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={s.head}>
            <MeetingsSummary live={liveAll} upcoming={upcoming.length} past={past.length} />
            {tab === "upcoming" ? live.map((m) => <LiveCard key={m.callId} item={m} mine={m.callerId === myId} onJoin={() => join(m)} onOpen={() => open(m)} />) : null}
            <Segmented value={tab} onChange={(v) => { setTab(v); setDay(null); }} options={[{ value: "upcoming", label: `${t("ms7.upcoming")} · ${upcoming.length}` }, { value: "past", label: `${t("ms7.past")} · ${past.length}` }]} />
            <WeekStrip anchor={anchor} counts={counts} value={day} onChange={setDay} onShift={shift} />
            {upcoming.length + past.length > LONG_LIST ? <View style={s.search}><SearchBox value={search} onChangeText={setSearch} placeholder={t("ms7.search")} /></View> : null}
            {day && shown ? <Text variant="small" tone="accent" weight="semibold" onPress={() => setDay(null)} accessibilityRole="button" style={s.clear}>{t("meetUx.allDays")}</Text> : null}
          </View>
        }
        ListEmptyComponent={empty}
        contentContainerStyle={[s.content, { paddingBottom: bottom + (canCreate ? 72 : 0) }]}
        refreshing={pulling}
        onRefresh={refresh}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      {canCreate ? <CreateFab label={t("ms7.new")} bottom={Math.max(16, bottom - 12)} onPress={() => setCreating(true)} /> : null}
      <CreateMeetingSheet visible={creating} onClose={() => setCreating(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 16, flexGrow: 1 },
  head: { gap: 12, marginBottom: 6 },
  search: { marginHorizontal: -16 },
  day: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, marginBottom: 2, marginLeft: 2 },
  grow: { flex: 1 },
  clear: { alignSelf: "flex-start", paddingVertical: 12, paddingHorizontal: 4 },
});
