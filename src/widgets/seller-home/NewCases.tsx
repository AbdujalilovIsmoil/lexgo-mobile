import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import type { ProOrder } from "@/entities/pro-order";
import { useAnswer } from "@/features/market-flow";
import type { SellerOrder } from "@/entities/pro-workspace";
import { DeclineSheet } from "@/features/pro-order-actions/DeclineSheet";
import { fmtDateTime } from "@/shared/lib/format";
import { radius, useColors } from "@/shared/theme";
import { Button, EmptyState, Icon, IconButton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Panel } from "./Panel";
import { RespondTimer } from "@/shared/ui/pro/RespondTimer";

const OPEN = new Set(["new", "offered", ""]);

function Card({ o, index }: { o: SellerOrder; index: number }) {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const [full, setFull] = useState(false);
  const [declining, setDeclining] = useState(false);
  const accept = useAnswer(o.id, { inPlace: false }).accept;
  const live = OPEN.has(o.status.toLowerCase()) && !!o.deadline;
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 5) * 60).duration(280)} style={[s.card, { backgroundColor: c.surface2, borderColor: c.line }]}>
      <View style={[s.edge, { backgroundColor: c.warn }]} />
      <View style={s.body}>
        <View style={s.head}>
          <Text variant="body" weight="bold" numberOfLines={2} style={s.flex}>{o.serviceName || t("shm.sd.newCases")}</Text>
          {live ? <RespondTimer deadline={o.deadline} /> : null}
        </View>
        {o.title ? <View style={[s.quote, { backgroundColor: c.surface }]}><Icon name="message-square" size={14} tone="gray" /><Text variant="small" numberOfLines={full ? undefined : 3} style={s.flex}>{o.title}</Text></View> : null}
        <View style={s.chips}>
          {o.region ? <View style={s.chip}><Icon name="map-pin" size={12} tone="gray" /><Text variant="caption" tone="gray">{o.region}</Text></View> : null}
          {o.budget ? <View style={s.chip}><Icon name="credit-card" size={12} tone="gray" /><Text variant="caption" weight="bold">{o.budget} {t("common.currency")}</Text></View> : null}
          {o.createdAt ? <View style={s.chip}><Icon name="clock" size={12} tone="gray" /><Text variant="caption" tone="gray">{fmtDateTime(o.createdAt, locale)}</Text></View> : null}
        </View>
        <View style={s.actions}>
          <Button title={t("sl9.accept")} icon="check" loading={accept.isPending} onPress={() => accept.mutate(undefined)} style={s.flex} />
          <IconButton icon="eye" size={46} label={t("shm.sd.review")} onPress={() => (o.title ? setFull((v) => !v) : router.push("/pro/orders" as never))} />
          <IconButton icon="x" size={46} label={t("sl9.decline")} onPress={() => setDeclining(true)} />
        </View>
      </View>
      <DeclineSheet order={{ id: o.id } as ProOrder} visible={declining} onClose={() => setDeclining(false)} />
    </Animated.View>
  );
}

// "Yangi keyslar": offered orders with the live response timer; read the client's words, accept or decline (with a reason) in place.
export function NewCases({ orders, i }: { orders: SellerOrder[]; i: number }) {
  const { t } = useT();
  return (
    <Panel i={i} icon="briefcase" tint="#E0457F" title={t("shm.sd.newCases")} sub={t("shm.sd.newCasesSub", { n: orders.length })}>
      {orders.length ? orders.map((o, k) => <Card key={o.id} o={o} index={k} />) : <EmptyState compact icon="briefcase" title={t("shm.sd.casesEmpty")} text={t("shm.sd.casesEmptyText")} />}
    </Panel>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: radius.r, borderWidth: 1, overflow: "hidden" },
  edge: { width: 5 },
  body: { flex: 1, gap: 10, padding: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  quote: { flexDirection: "row", gap: 8, padding: 10, borderRadius: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
});
