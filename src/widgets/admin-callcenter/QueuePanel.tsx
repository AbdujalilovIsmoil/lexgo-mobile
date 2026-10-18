import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { soft, useAssignNext, useMoveQueueLead, useQueue, type QueueItem } from "@/entities/admin-callcenter";
import { OptionSheet } from "@/shared/ui/admin";
import { CcTiles, TabList } from "@/shared/ui/cc";
import { confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { QueueTicket } from "./kit/QueueTicket";

// Default board stages an operator moves a lead to from the queue.
const STAGES = ["contacted", "qualified", "proposal", "won", "lost"];

// The order queue: leads, unassigned orders and urgent requests, SLA-breached first; refreshes every minute.
export function QueuePanel({ onOpenUrgent, bottomPad }: { onOpenUrgent: () => void; bottomPad?: number }) {
  const { t } = useT();
  const q = useQueue();
  const assign = useAssignNext();
  const move = useMoveQueueLead();
  const [moving, setMoving] = useState<QueueItem | null>(null);
  const [kind, setKind] = useState("");
  const all = q.data ?? [];
  const breached = all.filter((i) => i.slaBreached).length;
  const items = kind === "late" ? all.filter((i) => i.slaBreached) : kind ? all.filter((i) => i.type === kind) : all;
  const tiles = [{ value: "", label: t("adm.all"), count: all.length }, { value: "late", label: t("admCcH.late"), count: breached, alert: true }, ...["order", "lead", "urgent_advokat"].map((k) => ({ value: k, label: t(`admCc.qType.${k}`), count: all.filter((i) => i.type === k).length }))];
  const ask = (item: QueueItem) =>
    confirmDialog({
      title: t("admCc.assignNext"), message: t("admCc.assignAsk", { title: item.title }), confirmLabel: t("admCc.assignNext"), cancelLabel: t("adm.cancel"), icon: "send",
      onConfirm: async () => { await assign.mutateAsync(item.id); },
    });
  const busy = (i: QueueItem) => (assign.isPending && assign.variables === i.id) || (move.isPending && move.variables?.id === i.id);
  const header = <View style={s.head}><CcTiles options={tiles} value={kind} onChange={setKind} /></View>;
  return (
    <>
      <TabList
        bottomPad={bottomPad} data={items} query={soft(q)} keyExtractor={(i) => `${i.type}-${i.id}`} header={header}
        empty={{ icon: "inbox", title: t("admCc.queueEmpty") }}
        renderItem={(i) => <QueueTicket item={i} busy={busy(i)} onAssign={() => ask(i)} onMove={() => setMoving(i)} onUrgent={onOpenUrgent} />}
      />
      <OptionSheet
        visible={!!moving} onClose={() => setMoving(null)} title={t("admCc.moveStage")}
        options={STAGES.filter((x) => x !== moving?.status).map((x) => ({ value: x, label: t(`admCc.stage.${x}`) }))}
        onPick={(key) => moving && move.mutate({ id: moving.id, key })}
      />
    </>
  );
}

const s = StyleSheet.create({ head: { marginHorizontal: -16, paddingBottom: 12 } });
