import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import type { Job } from "@/entities/market-feed";
import { useTakeJob } from "@/entities/market-feed";
import type { ProOrder } from "@/entities/pro-order";
import { DeclineSheet } from "@/features/pro-order-actions/DeclineSheet";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useNow } from "@/shared/lib/pay/useNow";
import { radius, useColors } from "@/shared/theme";
import { Button, Icon, IconButton, PressableScale, Text, toast } from "@/shared/ui";
import { RespondTimer } from "@/shared/ui/pro/RespondTimer";

// One open order: the service and the live response timer, the client's own words (tap to read all), where and how much, and the three
// moves — accept (primary), look at the details, decline with a reason.
export function JobCard({ job, blocked, onGone }: { job: Job; blocked: boolean; onGone: (id: string) => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const [full, setFull] = useState(false);
  const [declining, setDeclining] = useState(false);
  const take = useTakeJob((r) => { if (r === "taken") toast(t("mkt.taken"), "info"); else toast(t("sl9.done.accepted"), "ok"); onGone(job.id); });
  const now = useNow(!!job.deadlineAt, 15_000);
  const left = job.deadlineAt ? Date.parse(job.deadlineAt) - now : Infinity;
  const edge = left < 5 * 60_000 ? c.err : left < 30 * 60_000 ? c.warn : c.accent;
  return (
    <Animated.View entering={FadeIn.duration(260)} style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <View style={[s.edge, { backgroundColor: edge }]} />
      <View style={s.body}>
        <View style={s.head}>
          <Text variant="body" weight="bold" numberOfLines={2} style={s.flex}>{job.serviceName || job.title}</Text>
          {job.deadlineAt ? <RespondTimer deadline={job.deadlineAt} /> : null}
        </View>
        {job.serviceName && job.title ? (
          <PressableScale scale={0.99} onPress={() => setFull((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: full }} style={[s.quote, { backgroundColor: c.surface2 }]}>
            <Icon name="message-square" size={14} tone="gray" />
            <Text variant="small" numberOfLines={full ? undefined : 3} style={s.flex}>{job.title}</Text>
          </PressableScale>
        ) : null}
        <View style={s.chips}>
          <View style={[s.pill, { backgroundColor: job.amount ? `${c.ok}22` : c.surface2 }]}>
            <Icon name="credit-card" size={13} color={job.amount ? c.ok : c.gray} />
            <Text variant="small" weight="bold" style={{ color: job.amount ? c.ok : c.gray }}>{job.amount ? `${fmtMoney(job.amount)} ${t("common.currency")}` : t("mkt.noBudget")}</Text>
          </View>
          {job.region ? <View style={s.chip}><Icon name="map-pin" size={13} tone="gray" /><Text variant="caption" tone="gray">{job.region}</Text></View> : null}
          {job.createdAt ? <View style={s.chip}><Icon name="clock" size={13} tone="gray" /><Text variant="caption" tone="gray">{fmtDateTime(job.createdAt, locale)}</Text></View> : null}
        </View>
        <View style={s.actions}>
          <Button title={t("mkt.accept")} icon="check" disabled={blocked} loading={take.isPending} onPress={() => take.mutate(job.id)} style={s.flex} />
          <IconButton icon="eye" size={46} label={t("mkt.details")} onPress={() => router.push({ pathname: "/pro/orders/[id]", params: { id: job.id } } as never)} />
          <IconButton icon="x" size={46} label={t("mkt.decline")} onPress={() => setDeclining(true)} />
        </View>
      </View>
      <DeclineSheet order={{ id: job.id } as ProOrder} visible={declining} onClose={() => setDeclining(false)} />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  edge: { width: 5 },
  body: { flex: 1, gap: 10, padding: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  quote: { flexDirection: "row", gap: 8, padding: 11, borderRadius: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
});
