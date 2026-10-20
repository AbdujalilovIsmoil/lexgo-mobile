import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { IconButton } from "@/shared/ui";
import { AdminPage, ChipBar, PagedList } from "@/shared/ui/admin";
import { StudioGate, useJourneys, useStudioAccess } from "@/entities/admin-studio";
import { JourneyRow, NewJourneySheet } from "@/widgets/admin-studio";
import { useT } from "@/shared/i18n";

const STATUSES = ["", "draft", "in_progress", "completed", "abandoned", "archived"];

function Journeys() {
  const { t } = useT();
  const router = useRouter();
  const a = useStudioAccess();
  const [status, setStatus] = useState("");
  const [adding, setAdding] = useState(false);
  const { items, query } = useJourneys(status);
  const open = (id: string) => router.push({ pathname: "/manage/studio/journey", params: { id } } as never);
  return (
    <AdminPage title={t("admStudioD.journeys.title")} subtitle={t("admStudioD.journeys.sub")} right={a.canEdit ? <IconButton icon="plus" label={t("admStudioD.journeys.new")} onPress={() => setAdding(true)} /> : undefined}>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(j) => j.id}
        renderItem={(j) => <JourneyRow item={j} onPress={() => open(j.id)} />}
        empty={{ icon: "git-merge", title: t("admStudioD.journeys.empty"), text: t("admStudioD.journeys.emptyText") }}
        header={<View style={{ marginHorizontal: -16, paddingBottom: 10 }}><ChipBar options={STATUSES.map((v) => ({ value: v, label: v ? t(`admStudioD.journeys.status.${v}`) : t("admStudioD.journeys.all") }))} value={status} onChange={setStatus} /></View>}
      />
      <NewJourneySheet visible={adding} onClose={() => setAdding(false)} onStarted={(j) => open(j.id)} />
    </AdminPage>
  );
}

// The user's creation journeys: status filter, progress of each, start a new one.
export default function StudioJourneysPage() {
  const { t } = useT();
  return <StudioGate need="any" title={t("admStudioD.journeys.title")}><Journeys /></StudioGate>;
}
