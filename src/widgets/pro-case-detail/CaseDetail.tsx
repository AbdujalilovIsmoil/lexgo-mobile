import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useCase, useCaseDocs, useCaseRoom } from "@/entities/pro-cases";
import { useClients } from "@/entities/pro-clients";
import { useTree } from "@/entities/pro-files";
import { useEvents } from "@/entities/pro-calendar";
import { useTasks } from "@/entities/pro-tasks";
import { CaseFormSheet } from "@/features/pro-case-form";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { EmptyState, ErrorView, Skeleton, Text } from "@/shared/ui";
import { CaseActions } from "./CaseActions";
import { CaseAi } from "./CaseAi";
import { CaseDocs } from "./CaseDocs";
import { CaseEvents } from "./CaseEvents";
import { CaseHero } from "./CaseHero";
import { CaseHistory } from "./CaseHistory";
import { CaseTabs, type CaseTab } from "./CaseTabs";
import { CaseTasks } from "./CaseTasks";

// Case detail: hero (client, status, progress, deadline, next step), shortcuts, the description, then docs / tasks / events /
// history / AI as tabs with item counts.
export function CaseDetail({ id }: { id: string }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const q = useCase(id);
  const clients = useClients().data;
  const room = useCaseRoom(id, q.data?.orderId ?? "");
  const tree = useTree(id).data;
  const records = useCaseDocs(id).data;
  const files = (tree?.files ?? []).filter((f) => f.caseId === id).length + (records ?? []).length;
  const tasks = (useTasks().data ?? []).filter((x) => x.caseId === id).length;
  const events = (useEvents().data ?? []).filter((e) => e.caseId === id).length;
  const [tab, setTab] = useState<CaseTab>("docs");
  const [manage, setManage] = useState(false);
  if (q.isLoading) return <View style={s.pad}><Skeleton height={250} round={24} /><Skeleton height={86} round={18} /><Skeleton height={44} round={22} /></View>;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => void q.refetch()} />;
  const item = q.data;
  if (!item) return <EmptyState icon="briefcase" title={t("aw4.notFound")} />;
  const owner = clients?.find((x) => x.id === item.clientUserId);
  return (
    <ScrollView contentContainerStyle={[s.pad, { paddingBottom: insets.bottom + 40 }]} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />} showsVerticalScrollIndicator={false}>
      <CaseHero item={item} client={owner?.name} />
      <CaseActions item={item} phone={owner?.phone} roomId={room.data ?? ""} onManage={() => setManage(true)} />
      {item.description ? (
        <View style={[s.about, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Text variant="small" weight="bold" tone="gray">{t("csd.about")}</Text>
          <Text variant="body">{item.description}</Text>
        </View>
      ) : null}
      <CaseTabs value={tab} onChange={setTab} counts={{ docs: files, tasks, events }} />
      {tab === "docs" ? <CaseDocs caseId={id} /> : tab === "tasks" ? <CaseTasks caseId={id} /> : tab === "events" ? <CaseEvents caseId={id} /> : tab === "history" ? <CaseHistory caseId={id} /> : <CaseAi caseId={id} />}
      <CaseFormSheet visible={manage} onClose={() => setManage(false)} item={item} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, gap: 14 },
  about: { gap: 6, padding: 16, borderRadius: 20, borderWidth: 1 },
});
