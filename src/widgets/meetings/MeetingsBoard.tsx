import { useState } from "react";
import { SectionList, View } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState, ErrorView, Skeleton, Text } from "@/shared/ui";
import { CcTiles } from "@/shared/ui/cc";
import { SearchBox } from "@/shared/ui/admin";
import { callPath, isLive, meetingPath, type CallType } from "@/entities/call";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { useMeetings } from "@/features/meeting";
import { useSellerActions } from "@/features/secure-chat";
import { useT } from "@/shared/i18n";
import { useTimeline } from "./lib/useTimeline";
import { CreateMeetingSheet } from "./CreateMeetingSheet";
import { LiveCard } from "./LiveCard";
import { MeetingsHero } from "./MeetingsHero";
import { TimelineRow } from "./TimelineRow";

type Tab = "upcoming" | "past";

// My meetings as a day timeline: what is live now on top (big Join), then the days, each meeting on a time rail.
export function MeetingsBoard({ bottom }: { bottom: number }) {
  const { t } = useT();
  const router = useRouter();
  const myId = useSession()?.user.id ?? "";
  const sellerCalls = useSellerActions().calls;
  const canCreate = useAccess().canCalls && sellerCalls;
  const { q, upcoming, past } = useMeetings();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState<CallType>("video");
  const start = (k: CallType) => { setKind(k); setCreating(true); };
  const open = (m: { callId: string; roomId: string }) => router.push(meetingPath(m.callId, m.roomId) as never);
  const join = (m: { callId: string; roomId: string }) => router.push(callPath(m.roomId, m.callId) as never);
  const { live, sections } = useTimeline(tab === "upcoming" ? upcoming : past, search);
  const empty = q.isLoading ? <View style={{ gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={96} round={20} />)}</View>
    : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} />
    : live.length ? null : <EmptyState icon="video" title={t(tab === "upcoming" ? "ms7.emptyUp" : "ms7.emptyPast")} text={t("admMeet.emptyText")} actionLabel={canCreate && tab === "upcoming" ? t("ms7.new") : undefined} onAction={() => start("video")} />;
  return (
    <>
      <SectionList
        sections={q.isLoading ? [] : sections}
        keyExtractor={(m) => m.callId}
        renderSectionHeader={({ section }) => <Text variant="kicker" tone="gray2" style={{ marginTop: 14, marginBottom: 2, marginLeft: 4 }}>{section.title.toUpperCase()} · {section.data.length}</Text>}
        renderItem={({ item, index, section }) => <TimelineRow item={item} myId={myId} first={index === 0} last={index === section.data.length - 1} onOpen={() => open(item)} onJoin={() => join(item)} />}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <MeetingsHero live={upcoming.filter((m) => isLive(m.callStatus)).length} canCreate={canCreate} onStart={start} />
            <View style={{ marginHorizontal: -16 }}><CcTiles value={tab} onChange={(v) => setTab(v as Tab)} options={[{ value: "upcoming", label: t("ms7.upcoming"), count: upcoming.length }, { value: "past", label: t("ms7.past"), count: past.length }]} /></View>
            {upcoming.length + past.length > 5 ? <View style={{ marginHorizontal: -16 }}><SearchBox value={search} onChangeText={setSearch} placeholder={t("ms7.search")} /></View> : null}
            {live.map((m) => <LiveCard key={m.callId} item={m} mine={m.callerId === myId} onJoin={() => join(m)} onOpen={() => open(m)} />)}
          </View>
        }
        ListEmptyComponent={empty}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom, flexGrow: 1 }}
        refreshing={q.isRefetching}
        onRefresh={() => void q.refetch()}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      <CreateMeetingSheet key={kind} visible={creating} onClose={() => setCreating(false)} initialType={kind} />
    </>
  );
}
