import { ScrollView, StyleSheet, View } from "react-native";
import { Button, EmptyState, ErrorView, Skeleton, Text, confirmDialog } from "@/shared/ui";
import { FactRows, RowCard, SectionCard, StatusPill } from "@/shared/ui/admin";
import { csLabel } from "@/entities/call";
import type { useMeeting } from "@/features/meeting";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// A meeting's page: status, who hosts it, times and remaining minutes, the roster, the recording state — and the
// actions the server allows (join / rejoin while it runs, open the chat, the host ends it).
export function MeetingDetail({ m, bottom }: { m: ReturnType<typeof useMeeting>; bottom: number }) {
  const { t, locale } = useT();
  const c = m.call;
  if (m.loading) return <View style={s.pad}><Skeleton height={120} round={20} /><Skeleton height={180} round={20} /></View>;
  if (!c) return m.error ? <ErrorView error={m.error} onRetry={m.refetch} /> : <EmptyState icon="video-off" title={t("ms7.notFound")} />;
  const state = (st: string) => (t(`admMeetB.p.${st}`) === `admMeetB.p.${st}` ? humanizeSlug(st) : t(`admMeetB.p.${st}`));
  const host = c.participants.find((p) => p.role === "host");
  const end = () => confirmDialog({ title: t("ms7.endTitle"), message: t("ms7.endText"), confirmLabel: t("admMeet.endAll"), cancelLabel: t("adm.cancel"), icon: "phone-off", danger: true, onConfirm: () => m.end.mutateAsync() });
  return (
    <ScrollView contentContainerStyle={[s.body, { paddingBottom: bottom }]} showsVerticalScrollIndicator={false}>
      <View style={s.head}>
        <Text variant="h3" style={s.flex}>{c.title || t("admMeet.untitled")}</Text>
        <StatusPill status={c.status} label={csLabel(t, c.status)} />
      </View>
      <FactRows rows={[
        { label: t("admMeet.type"), value: t(`admMeet.fmt.${c.type}`) },
        { label: t("admMeet.creator"), value: host?.name || m.row?.callerName },
        { label: t("admMeet.started"), value: fmtDateTime(c.startedAt, locale) },
        { label: m.live ? t("ms7.endsAt") : t("admMeet.endedAt"), value: fmtDateTime(m.live ? c.autoEndAt : c.endedAt, locale) },
        { label: t("admMeet.duration"), value: c.maxMinutes ? t("admMeet.minutes", { n: c.maxMinutes }) : "" },
        { label: t("ms7.recording"), value: c.recording.state === "off" ? "" : t(`ms6.rec.${c.recording.state}`) },
      ]} />
      <SectionCard title={`${t("admMeet.participants")} (${c.participants.length})`}>
        {c.participants.map((p) => <RowCard key={p.userId} avatar={p.name || "?"} title={p.name || t("admMeet.someone")} subtitle={[p.role === "host" ? t("admMeetB.host") : "", state(p.status)].filter(Boolean).join(" · ")} />)}
      </SectionCard>
      {m.canJoin ? <Button title={m.row?.status === "joined" || host?.userId === m.row?.callerId ? t("admMeet.rejoin") : t("admMeet.join")} icon={c.type === "audio" ? "phone" : "video"} variant="gradient" full onPress={m.join} /> : null}
      <Button title={t("ms7.openChat")} icon="message-circle" variant="soft" full onPress={m.chat} />
      {m.live && c.perms.canEnd ? <Button title={t("admMeet.endAll")} icon="phone-off" variant="line" full onPress={end} loading={m.end.isPending} /> : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({ pad: { padding: 16, gap: 12 }, body: { padding: 16, gap: 14 }, head: { flexDirection: "row", alignItems: "center", gap: 10 }, flex: { flex: 1 } });
