import { useBoard, useCalls, useComplaints, useQueue, useUrgentList, isOpen } from "@/entities/admin-callcenter";
import { useT } from "@/shared/i18n";
import { HubCard, type HubCardProps } from "./HubCard";

type P = Pick<HubCardProps, "index" | "onPress">;

export function QueueCard(p: P) {
  const { t } = useT();
  const q = useQueue();
  const n = q.data?.filter((i) => i.slaBreached).length ?? 0;
  return <HubCard {...p} icon="inbox" colors={["#1668F0", "#5CA8FF"]} title={t("admCc.pg.queue")} loading={q.isLoading} value={String(q.data?.length ?? 0)} alert={n ? t("admCc.breachedN", { n }) : undefined} note={t("admCcH.queueNote")} />;
}

export function UrgentCard(p: P) {
  const { t } = useT();
  const q = useUrgentList({ kind: "", channel: "" });
  return <HubCard {...p} icon="phone-call" colors={["#E0457F", "#FF8DB8"]} title={t("admCc.pg.urgent")} loading={q.isLoading} value={String(q.data?.filter(isOpen).length ?? 0)} note={t("admCcH.urgentNote")} />;
}

export function ComplaintsCard(p: P) {
  const { t } = useT();
  const q = useComplaints("");
  return <HubCard {...p} icon="alert-triangle" colors={["#C2680A", "#FBC15E"]} title={t("admCc.pg.complaints")} loading={q.isLoading} value={String(q.data?.count ?? q.data?.items.length ?? 0)} note={t("admCcH.complaintsNote")} />;
}

export function BoardCard(p: P) {
  const { t } = useT();
  const q = useBoard();
  return <HubCard {...p} icon="layers" colors={["#7A5CFF", "#B7A4FF"]} title={t("admCc.pg.board")} loading={q.isLoading} value={String(q.data?.reduce((n, c) => n + c.cards.length, 0) ?? 0)} note={t("admCcH.boardNote")} />;
}

export const ClientsCard = (p: P) => { const { t } = useT(); return <HubCard {...p} icon="search" colors={["#00A870", "#3DDC97"]} title={t("admCc.pg.clients")} value={t("admCcH.search")} note={t("admCcH.clientsNote")} />; };

export function CallsCard(p: P) {
  const { t } = useT();
  const q = useCalls();
  return <HubCard {...p} icon="phone" colors={["#154CB0", "#2E8BFF"]} title={t("admCc.pg.calls")} loading={q.isLoading} value={String(q.data?.length ?? 0)} note={t("admCcH.callsNote")} />;
}
