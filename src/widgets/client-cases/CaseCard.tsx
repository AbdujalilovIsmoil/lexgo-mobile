import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { clientStageOf, type CaseItem, type ClientCase } from "@/entities/client-case";
import { CaseMeta } from "./CaseMeta";
import { HistoryPanel } from "./HistoryPanel";
import { MilestonesPanel } from "./MilestonesPanel";
import { StageTrack } from "./StageTrack";
import { useCaseText } from "./useCaseText";

type Props = { item: CaseItem; onDocs: (c: ClientCase) => void; onRequest: (c: ClientCase) => void };

// One legal case (with its order) or an order without a case: stage, deadline, panels and actions.
export function CaseCard({ item, onDocs, onRequest }: Props) {
  const { t } = useT();
  const text = useCaseText();
  const [panel, setPanel] = useState<"" | "ms" | "hist">("");
  const { case: c, order: o } = item;
  const orderId = c?.orderId || o?.id || "";
  const status = o?.status || "";
  const stage = status ? clientStageOf(status) : null;
  const title = c ? c.caseType || c.title || t("ccs.title") : o?.serviceName || o?.title || t("ccs.orderItem");
  const sub = [c?.stage ? text.status(c.stage) : "", c?.status ? text.status(c.status) : ""].filter(Boolean).join(" · ") || (o?.title && o.title !== o.serviceName ? o.title : "");
  const badge = status ? text.order(status) : c?.status ? text.status(c.status) : "";
  const toggle = (p: "ms" | "hist") => setPanel((cur) => (cur === p ? "" : p));
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="body" weight="bold" numberOfLines={2} style={s.flex}>{title}</Text>
        {badge ? <Pill label={badge} tone={stage === "done" ? "ok" : "blue"} small /> : null}
      </View>
      {!c && o?.workId ? <Text variant="caption" tone="gray2">{o.workId}</Text> : null}
      {sub ? <Text variant="small" tone="gray">{sub}</Text> : null}
      {stage ? <StageTrack stage={stage} /> : null}
      <CaseMeta item={item} />
      {orderId && panel === "ms" ? <MilestonesPanel orderId={orderId} /> : null}
      {orderId && panel === "hist" ? <HistoryPanel orderId={orderId} status={status} /> : null}
      <View style={s.acts}>
        {orderId ? <Button title={panel === "ms" ? t("ccs.hideMilestones") : t("ccs.milestonesCta")} size="sm" variant="line" onPress={() => toggle("ms")} /> : null}
        {orderId ? <Button title={panel === "hist" ? t("ccs.hideHistory") : t("ccs.historyCta")} size="sm" variant="line" onPress={() => toggle("hist")} /> : null}
        {c ? <Button title={t("ccs.docsCta")} size="sm" variant="line" onPress={() => onDocs(c)} /> : null}
        {c ? <Button title={t("ccs.requestCta")} size="sm" variant="line" onPress={() => onRequest(c)} /> : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 8, padding: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  acts: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 2 },
});
