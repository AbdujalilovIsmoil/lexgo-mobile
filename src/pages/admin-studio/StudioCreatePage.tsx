import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button, EmptyState, Icon, Input, PressableScale, Text, confirmDialog } from "@/shared/ui";
import { AdminPage, ChipBar } from "@/shared/ui/admin";
import { StudioGate, useJourneyAction, useJourneys, useStartJourney, useStudioAccess, type Journey } from "@/entities/admin-studio";
import { JourneyRow } from "@/widgets/admin-studio";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

type Kind = "service" | "package";

function Create() {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const a = useStudioAccess();
  const [kind, setKind] = useState<Kind>("service");
  const [name, setName] = useState("");
  const start = useStartJourney();
  const [filter, setFilter] = useState("draft");
  const list = useJourneys(filter);
  const act = useJourneyAction();
  const ask = (j: Journey, a: "abandon" | "archive" | "restore") => {
    if (a === "restore") return act.mutate({ id: j.id, action: a });
    const nm = j.title || "—";
    confirmDialog({ title: t(`admStudioD.jlist.${a}Title`, { name: nm }), message: t(`admStudioD.jlist.${a}Text`), confirmLabel: t(`admStudioD.jlist.${a}`), cancelLabel: t("adm.cancel"), icon: "alert-triangle", danger: true, onConfirm: async () => { await act.mutateAsync({ id: j.id, action: a }); } });
  };
  const open = (id: string) => router.push({ pathname: "/manage/studio/journey", params: { id } } as never);
  if (!a.canEdit) return <AdminPage title={t("admStudioD.create.title")}><EmptyState icon="lock" title={t("admStudioD.create.needEdit")} /></AdminPage>;
  const go = () => start.mutate({ type: kind, title: name.trim() }, { onSuccess: (j) => { setName(""); router.replace({ pathname: "/manage/studio/journey", params: { id: j.id } } as never); } });
  return (
    <AdminPage title={t("admStudioD.create.title")} subtitle={t("admStudioD.create.lead")}>
      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <Text variant="small" tone="gray">{t("admStudioD.create.kind")}</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {(["service", "package"] as const).map((k) => {
            const on = kind === k;
            return (
              <PressableScale key={k} onPress={() => setKind(k)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flex: 1, minHeight: 138, padding: 14, borderRadius: 20, borderWidth: 2, gap: 6, borderColor: on ? c.accent : c.line, backgroundColor: on ? `${c.accent}14` : c.surface }}>
                <Icon name={k === "service" ? "briefcase" : "package"} size={22} color={on ? c.accent : c.gray} />
                <Text variant="body" weight="bold">{t(`admStudioD.create.${k}`)}</Text>
                <Text variant="caption" tone="gray">{t(`admStudioD.create.${k}What`)}</Text>
              </PressableScale>
            );
          })}
        </View>
        <Input label={t("admStudioD.create.name")} value={name} onChangeText={setName} placeholder={t(kind === "service" ? "admStudioD.create.namePhService" : "admStudioD.create.namePhPackage")} maxLength={120} />
        <Button title={t("admStudioD.create.start")} icon="arrow-right" variant="gradient" full loading={start.isPending} disabled={!name.trim()} onPress={go} />
        <View style={{ gap: 10 }}>
          <Text variant="h4">{t("admStudioD.create.drafts")}</Text>
          <View style={{ marginHorizontal: -16 }}>
            <ChipBar options={["draft", "completed", "abandoned", "archived"].map((v) => ({ value: v, label: t(`admStudioD.jlist.${v}`) }))} value={filter} onChange={setFilter} />
          </View>
          {list.items.length ? list.items.map((j) => <JourneyRow key={j.id} item={j} onPress={() => open(j.id)} onAct={(x) => ask(j, x)} />) : <Text variant="small" tone="gray" center>{t(`admStudioD.jlist.empty.${filter}`)}</Text>}
          {list.query.hasNextPage ? <Button title={t("adm.loadMore")} variant="soft" full loading={list.query.isFetchingNextPage} onPress={() => void list.query.fetchNextPage?.()} /> : null}
        </View>
      </KeyboardAwareScrollView>
    </AdminPage>
  );
}

// "Yangi xizmat yoki paket": pick what to create, name it, start the step-by-step journey; unfinished ones wait below.
export default function StudioCreatePage() {
  const { t } = useT();
  return <StudioGate need="any" title={t("admStudioD.create.title")}><Create /></StudioGate>;
}
