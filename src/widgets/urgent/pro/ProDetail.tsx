import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRequest, useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { ErrorView, Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { ActionSheets } from "../ActionSheets";
import { useRequestActions } from "../useRequestActions";
import { ActionDock } from "./ActionDock";
import { DetailHero } from "./DetailHero";
import { Fade } from "./Fade";
import { FactsGrid } from "./FactsGrid";
import { Outcome } from "./Outcome";
import { RequestCard } from "./RequestCard";
import { Timeline } from "./Timeline";

type Q = { isRefetching: boolean; refetch: () => unknown };

function Body({ req, q }: { req: UrgentRequest; q: Q }) {
  const label = useUrgentLabels();
  const a = useRequestActions(req, "pro");
  return (
    <AdminPage title={label.kind(req.serviceKind, req.serviceTitle)} subtitle={req.workId} footer={a.actions.length ? <ActionDock actions={a.actions} /> : undefined}>
      <Scroll q={q}>
        {[<DetailHero key="h" req={req} />, <RequestCard key="r" req={req} />, <FactsGrid key="f" req={req} />, <Outcome key="o" req={req} />, <Timeline key="t" req={req} />].map((x, i) => <Fade key={x.key} i={i}>{x}</Fade>)}
      </Scroll>
      <ActionSheets req={req} panel={a.panel} meId={a.meId} onClose={() => a.setPanel("")} />
    </AdminPage>
  );
}

function Scroll({ q, children }: { q: Q; children: React.ReactNode }) {
  const insets = useInsets();
  return (
    <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />}>
      {children}
    </ScrollView>
  );
}

// /pro/urgent/[id] for an advocate: hero (status, time since the request, stage track, client), the request, key facts, history and a
// sticky action bar. Same data and same actions as before (useRequestActions).
export function ProDetail({ id }: { id: string }) {
  const { t } = useT();
  const q = useRequest(id);
  if (q.data) return <Body req={q.data} q={q} />;
  return (
    <AdminPage title={t("ugx.title")}>
      <Scroll q={q}>
        {q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} /> : <View style={s.sk}>{[190, 130, 150, 170].map((h) => <Skeleton key={h} height={h} round={20} />)}</View>}
      </Scroll>
    </AdminPage>
  );
}

const s = StyleSheet.create({ body: { padding: 16, gap: 14, flexGrow: 1 }, sk: { gap: 14 } });
