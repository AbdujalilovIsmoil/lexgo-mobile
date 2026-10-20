import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button, Card, EmptyState, Icon, Pill, PressableScale, Skeleton, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { AdminPage } from "@/shared/ui/admin";
import { StudioGate, useJourneyAction, type Journey, type JourneyStep } from "@/entities/admin-studio";
import { StepForm, useJourneyFlow } from "@/features/admin-studio/journey";
import { tOr } from "@/shared/lib/pro/tOr";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

const OPEN = ["draft", "in_progress"];

function Detail({ id }: { id: string }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const f = useJourneyFlow(id);
  const restore = useJourneyAction();
  const j = f.journey;
  const label = (s: JourneyStep) => tOr(t, `admStudioD.create.step.${s.key}`, s.title || s.key);
  if (f.loadError) return <AdminPage title={t("admStudioD.create.title")}><EmptyState icon="git-merge" title={t("admStudioD.create.missing")} text={t("admStudioD.create.missingText")} /></AdminPage>;
  if (!j) return <AdminPage title={t("admStudioD.create.title")}><View style={{ padding: 16, gap: 12 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={90} round={20} />)}</View></AdminPage>;
  const open = OPEN.includes(j.status) || j.status === "";
  const step = f.current;
  const last = !!step && step.key === j.steps[j.steps.length - 1]?.key;
  const stateOf = (s: JourneyStep) => (f.bad.includes(s.key) ? "err" : j.completed.includes(s.key) ? "done" : s.key === step?.key ? "now" : "todo");
  const missing = (list: Journey) => list.steps.filter((s) => s.required && !list.completed.includes(s.key) && s.key !== step?.key);
  const footer = open && step && !f.sent && !f.readOnly ? (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Button title={t("admStudioD.create.later")} variant="line" onPress={() => router.back()} style={{ flex: 1 }} />
      <Button title={t(last ? "admStudioD.create.send" : "admStudioD.create.saveNext")} icon={last ? "send" : "arrow-right"} variant="gradient" loading={!!f.busy} onPress={() => void (last ? f.send(step) : f.saveStep(step))} style={{ flex: 1.4 }} />
    </View>
  ) : undefined;
  return (
    <AdminPage title={j.title || tOr(t, `admStudioD.journeys.types.${j.type}`, j.type)} subtitle={tOr(t, `admStudioD.journeys.types.${j.type}`, j.type)} footer={footer}>
      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pill small tone="blue" label={tOr(t, `admStudioD.journeys.status.${j.status}`, j.status)} />
            <Text variant="caption" tone="gray">{t("admStudioD.journeys.progress", { done: j.done, total: j.total })}</Text>
          </View>
          <ProgressBar value={j.percent / 100} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {j.steps.map((s) => {
            const st = stateOf(s);
            const tint = st === "err" ? c.err : st === "done" ? c.ok : st === "now" ? c.accent : c.gray2;
            return (
              <PressableScale key={s.key} onPress={() => f.setAt(s.key)} accessibilityLabel={label(s)} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: st === "now" ? `${c.accent}22` : c.surface2, borderWidth: 1.5, borderColor: st === "now" ? c.accent : "transparent" }}>
                <Icon name={st === "done" ? "check-circle" : st === "err" ? "alert-circle" : "circle"} size={15} color={tint} />
                <Text variant="caption" weight="bold" style={{ color: st === "todo" ? c.gray : c.ink }}>{label(s)}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>
        {!open ? (
          <Card style={{ gap: 10 }}>
            <Text variant="body" weight="bold">{tOr(t, `admStudioD.journeys.status.${j.status}`, j.status)}</Text>
            <Text variant="small" tone="gray">{t("admStudioD.create.closedText")}</Text>
            {j.actions.restore && !f.readOnly ? <Button title={t("admStudioD.journeys.restore")} icon="rotate-ccw" variant="soft" loading={restore.isPending} onPress={() => restore.mutate({ id: j.id, action: "restore" })} style={{ alignSelf: "flex-start" }} /> : null}
          </Card>
        ) : f.sent ? (
          <Card style={{ gap: 10 }}>
            <Icon name="check-circle" size={28} color={c.ok} />
            <Text variant="h4">{t("admStudioD.create.doneTitle")}</Text>
            <Text variant="small" tone="gray">{j.status === "completed" || !missing(j).length ? t("admStudioD.create.doneText") : t("admStudioD.create.notCompleted", { list: missing(j).map(label).join(", ") })}</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {f.objectId ? <Button title={t("admStudioD.create.openRecord")} icon="external-link" size="sm" onPress={() => router.replace({ pathname: "/manage/studio/object", params: { id: f.objectId } } as never)} /> : null}
              <Button title={t("admStudioD.create.backList")} variant="line" size="sm" onPress={() => router.replace("/manage/studio/create" as never)} />
            </View>
          </Card>
        ) : step ? (
          <View style={{ gap: 12 }}>
            <Text variant="h4">{label(step)}</Text>
            {last ? (
              <View style={{ gap: 10 }}>
                <Text variant="small" tone="gray">{t("admStudioD.create.reviewLead")}</Text>
                {f.bad.length ? <Text variant="small" tone="err">{t("admStudioD.create.reviewErrors", { list: j.steps.filter((s) => f.bad.includes(s.key)).map(label).join(", ") })}</Text> : null}
              </View>
            ) : <StepForm step={step} ctor={f.ctor} payload={f.payload} onChange={(p) => f.setPayload(p)} errors={f.errors} readOnly={f.readOnly} />}
            {f.error ? <Text variant="small" tone="err">{f.error}</Text> : null}
          </View>
        ) : null}
      </KeyboardAwareScrollView>
    </AdminPage>
  );
}

// One creation journey as a flow: the steps in order, each saved as you go, the last one checks everything and sends it for approval.
export default function StudioJourneyPage() {
  const { t } = useT();
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  return <StudioGate need="any" title={t("admStudioD.create.title")}><Detail id={id} /></StudioGate>;
}
