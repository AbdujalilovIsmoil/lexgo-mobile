import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, ErrorView, Pill, Skeleton, Text, confirmDialog } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { AdminPage } from "@/shared/ui/admin";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StudioGate, useJourney, useJourneyAction, usePatchJourney, useStudioAccess, type JourneyStep } from "@/entities/admin-studio";
import { JourneySteps } from "@/widgets/admin-studio";
import { tOr } from "@/shared/lib/pro/tOr";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

function Detail({ id }: { id: string }) {
  const { t } = useT();
  const insets = useInsets();
  const router = useRouter();
  const a = useStudioAccess();
  const q = useJourney(id);
  const patch = usePatchJourney();
  const act = useJourneyAction();
  const j = q.data;
  if (q.isError) return <AdminPage title={t("admStudioD.journeys.title")}><ErrorView error={q.error} onRetry={() => void q.refetch()} /></AdminPage>;
  if (!j) return <AdminPage title={t("admStudioD.journeys.title")}><View style={{ padding: 16, gap: 12 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={90} round={20} />)}</View></AdminPage>;
  const toggle = (st: JourneyStep) => {
    const done = j.completed.includes(st.key);
    const completed = done ? j.completed.filter((k) => k !== st.key) : [...j.completed, st.key];
    const next = done ? st.key : j.steps.find((x) => !completed.includes(x.key))?.key ?? st.key;
    patch.mutate({ id: j.id, completed, current: next });
  };
  const open = (st: JourneyStep) => router.push({ pathname: "/manage/studio/object", params: { code: st.formCode } } as never);
  const ask = (action: "abandon" | "archive", q1: string) => confirmDialog({ title: t(q1), message: j.title, confirmLabel: t(`admStudioD.journeys.${action}`), cancelLabel: t("adm.cancel"), icon: "alert-triangle", danger: true, onConfirm: async () => { await act.mutateAsync({ id: j.id, action }); } });
  return (
    <AdminPage title={j.title || tOr(t, `admStudioD.journeys.types.${j.type}`, j.type)} subtitle={tOr(t, `admStudioD.journeys.types.${j.type}`, j.type)}>
      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 24 }}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pill small tone="blue" label={tOr(t, `admStudioD.journeys.status.${j.status}`, j.status)} />
            <Text variant="caption" tone="gray">{t("admStudioD.journeys.progress", { done: j.done, total: j.total })}</Text>
          </View>
          <ProgressBar value={j.percent / 100} />
        </View>
        <JourneySteps journey={j} busy={patch.isPending} canEdit={a.canEdit} onToggle={toggle} onOpen={open} />
        {a.canEdit ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {j.actions.abandon ? <Button title={t("admStudioD.journeys.abandon")} icon="x-circle" variant="line" size="sm" onPress={() => ask("abandon", "admStudioD.journeys.abandonQ")} /> : null}
            {j.actions.archive ? <Button title={t("admStudioD.journeys.archive")} icon="archive" variant="line" size="sm" onPress={() => ask("archive", "admStudioD.journeys.archiveQ")} /> : null}
            {j.actions.restore ? <Button title={t("admStudioD.journeys.restore")} icon="rotate-ccw" variant="soft" size="sm" loading={act.isPending} onPress={() => act.mutate({ id: j.id, action: "restore" })} /> : null}
          </View>
        ) : null}
      </KeyboardAwareScrollView>
    </AdminPage>
  );
}

// One journey: progress, its steps in order (open the form / mark done) and abandon / archive / restore.
export default function StudioJourneyPage() {
  const { t } = useT();
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  return <StudioGate need="any" title={t("admStudioD.journeys.title")}><Detail id={id} /></StudioGate>;
}
