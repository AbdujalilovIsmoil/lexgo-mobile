import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { assistBlockOf, isClosed, useAssistContext, usePlans, type AssistBlock, type AssistSent, type CallKind, type SupportTicket } from "@/entities/admin-support";
import { Card, Skeleton, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { AddPayPanel } from "./assist/AddPayPanel";
import { AssistActions, type AssistSheetKey } from "./assist/AssistActions";
import { AssistAiHistory } from "./assist/AssistAiHistory";
import { AssistClientCard } from "./assist/AssistClientCard";
import { AssistLock, type LockKind } from "./assist/AssistLock";
import { AssistOverview } from "./assist/AssistOverview";
import { AssistResults } from "./assist/AssistResults";
import { AssistSheets } from "./assist/AssistSheets";

type Acc = { ownOpen: boolean; watching: boolean; open: boolean };
type Props = { ticket: SupportTicket; acc: Acc; onCall?: (k: CallKind) => void; calling: CallKind | "" };
const LOCK_OF: Record<AssistBlock, LockKind> = { closed: "closed", notClient: "notClient", notAssigned: "other", missing: "missing", unavailable: "unavailable" };

// Assist tab: the client's context and the requests an operator may create for them (own ticket only; supervisors view).
export function AssistView({ ticket, acc, onCall, calling }: Props) {
  const { t, locale } = useT();
  const insets = useInsets();
  const active = (acc.ownOpen || acc.watching) && !!ticket.operatorUserId;
  const q = useAssistContext(ticket.id, active);
  const plans = usePlans(locale, active);
  const [sent, setSent] = useState<AssistSent[]>([]);
  const [sheet, setSheet] = useState<AssistSheetKey | null>(null);
  const [hard, setHard] = useState<AssistBlock | null>(null);
  const [pulling, setPulling] = useState(false);
  const block = hard ?? assistBlockOf(q.error);
  const retry = () => { setHard(null); void q.refetch(); };
  const onBlock = (e: unknown) => {
    const b = assistBlockOf(e);
    if (!b || b === "unavailable") return false;
    setHard(b);
    return true;
  };
  if (!active) return ticket.status ? <AssistLock kind={isClosed(ticket.status) ? "closed" : ticket.operatorUserId ? "other" : "claim"} /> : <Skeleton height={110} round={20} />;
  if (block) return <AssistLock kind={LOCK_OF[block]} onRetry={block === "unavailable" || block === "notAssigned" ? retry : undefined} />;
  if (q.isLoading) return <View style={{ padding: 16, gap: 12 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={110} round={20} />)}</View>;
  const ctx = q.data;
  if (!ctx) return <AssistLock kind="error" onRetry={retry} />;
  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }} refreshControl={<RefreshControl refreshing={pulling} onRefresh={() => { setPulling(true); void q.refetch().finally(() => setPulling(false)); }} />} keyboardShouldPersistTaps="handled">
        {q.isError ? <Text variant="small" tone="warn">{t("admSupB.stale")}</Text> : null}
        {acc.watching && !acc.ownOpen ? <Card tinted><Text variant="small">{t("admSupB.viewOnly")}</Text></Card> : null}
        <AssistClientCard ctx={ctx} ticket={ticket} onCall={acc.ownOpen ? onCall : undefined} calling={calling} />
        <AssistResults sent={sent} ctx={ctx} ctxAt={q.dataUpdatedAt} onDismiss={(k) => setSent((cur) => cur.filter((x) => x.key !== k))} />
        <AssistAiHistory history={ctx.ai} />
        <AssistOverview ctx={ctx} plans={plans.data ?? []} />
        <AddPayPanel ctx={ctx} ticketId={ticket.id} canAct={acc.ownOpen} onBlock={onBlock} />
        {acc.ownOpen ? <AssistActions caps={ctx.caps} onOpen={setSheet} /> : null}
      </ScrollView>
      <AssistSheets sheet={sheet} onClose={() => setSheet(null)} ticket={ticket} ctx={ctx} onBlock={onBlock} onSent={(r) => setSent((cur) => [r, ...cur.filter((x) => x.key !== r.key)])} />
    </>
  );
}
