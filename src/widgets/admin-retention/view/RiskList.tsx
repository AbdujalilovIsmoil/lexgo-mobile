import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { CcTiles } from "@/shared/ui/cc";
import { Can } from "@/entities/access";
import type { RetCtx } from "../useRetentionCtx";
import { RiskTicket } from "./RiskTicket";
import { useWinBackFlow } from "./useWinBackFlow";

const PAGE = 10;

// At-risk clients: filter tiles by reason, tickets with call / win back, "add everybody" and 10-at-a-time paging.
export function RiskList({ x }: { x: RetCtx }) {
  const { t, label, d } = x;
  const flow = useWinBackFlow(x.demo);
  const [reason, setReason] = useState("");
  const [shown, setShown] = useState(PAGE);
  const reasons = [...new Set(d.atRiskClients.flatMap((c) => c.reasons))];
  const list = reason ? d.atRiskClients.filter((c) => c.reasons.includes(reason)) : d.atRiskClients;
  const tiles = [{ value: "", label: t("adm.all"), count: d.atRiskClients.length }, ...reasons.map((r) => ({ value: r, label: label.reason(r), count: d.atRiskClients.filter((c) => c.reasons.includes(r)).length }))];
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h4">{t("admRet.atRiskTitle")}</Text>
      {d.atRiskClients.length ? (
        <>
          {reasons.length > 1 ? <View style={{ marginHorizontal: -16 }}><CcTiles options={tiles} value={reason} onChange={(v) => { setReason(v); setShown(PAGE); }} /></View> : null}
          <Can perm="leads.manage"><Button title={t("admRetV.addAll", { n: list.filter((c) => !flow.done.includes(flow.keyOf(c))).length })} icon="rotate-ccw" variant="gradient" onPress={() => flow.all(list)} full /></Can>
          {list.slice(0, shown).map((c, i) => <RiskTicket key={flow.keyOf(c) || i} x={x} client={c} done={flow.done.includes(flow.keyOf(c))} busy={flow.busy === flow.keyOf(c)} onWinBack={() => void flow.one(c)} />)}
          {list.length > shown ? <Button title={t("adm.loadMore")} variant="soft" full onPress={() => setShown(shown + PAGE)} /> : null}
        </>
      ) : <Text variant="small" tone="gray">{t("admRet.noRisk")}</Text>}
    </View>
  );
}
