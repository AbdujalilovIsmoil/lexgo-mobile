import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useTemplateDetail, useLinkedServices } from "@/entities/doc-template";
import { useTemplateRender } from "@/entities/doc-form";
import { gateText, useDocSettings } from "@/entities/doc-settings";
import { useIsAuthed } from "@/entities/session";
import { useCleanTemplate } from "@/features/template-open";
import { TemplateGates } from "@/widgets/ai-plan-upgrade";
import { categoryLabel, languageLabel } from "@/widgets/doc-catalog";
import { trackDoc } from "@/shared/analytics";
import { fmtMoney } from "@/shared/lib/money";
import { useInsets } from "@/shared/lib/insets";
import { radius, useColors } from "@/shared/theme";
import { Button, Card, EmptyState, ErrorView, Pill, Skeleton, Text } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { TemplateActions } from "./TemplateActions";
import { TemplatePreview } from "./TemplatePreview";

// /templates/[id] — one ready document: title, description, category and language, the full preview, and the three ways on (README §3.2).
// The template is read again from the server on opening (never only the list row). A template with a linked service uses the service's
// own screens; one without goes through the generic /document-requests flow. A guest reads everything; acting needs an account.
// The document service settings (TZ.md §4) decide the ways: a mode switched off is not offered, one outside the plan shows a lock and
// why, and the blank is offered only while DOCX downloads are open.
export function TemplateDetailPage({ id }: { id: string }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const insets = useInsets();
  const authed = useIsAuthed();
  const ds = useDocSettings();
  const q = useTemplateDetail(id);
  const render = useTemplateRender(id);
  const linked = useLinkedServices();
  const [full, setFull] = useState(false);
  const tpl = q.data;
  const serviceId = linked.data?.[id];
  const clean = useCleanTemplate({ id, name: tpl?.name ?? "", category: tpl?.category, language: tpl?.language }, serviceId);
  const text = render.data?.preview.text || tpl?.text || "";

  useEffect(() => { if (tpl) trackDoc("document_template_opened", { category: tpl.category, language: tpl.language }); }, [tpl?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const need = (go: () => void) => () => (authed ? go() : router.push("/auth/login"));
  const ways = ds.offer([
    { key: "fill", mode: "manual" as const, icon: "edit-3" as const, primary: true, title: t("dcat.fillSelf"), hint: t("dcat.fillSelfHint"), onPress: need(() => router.push((serviceId ? `/services/${serviceId}/fill` : `/templates/${id}/fill`) as never)) },
    { key: "lawyer", mode: "lawyer" as const, icon: "headphones" as const, title: t("dcat.withLawyer"), hint: t("dcat.withLawyerHint"), onPress: need(() => router.push((serviceId ? `/services/${serviceId}/lawyer` : `/templates/${id}/lawyer`) as never)) },
  ]);
  const actions = [
    ...ways.map((a) => (a.gate.state === "locked" ? { ...a, icon: "lock" as const, hint: gateText(t, a.gate) } : a)),
    ...(tpl?.hasSource && ds.downloadOk("docx") ? [{ key: "clean", icon: "download" as const, title: t("dcat.downloadClean"), hint: t("dcat.downloadCleanHint"), busy: clean.busy, onPress: need(() => void clean.download()) }] : []),
  ];
  const title = tpl?.name || t("dcat.docTitle");
  const missing = q.isError && !tpl;
  return (
    <AdminPage title={title} subtitle={tpl ? categoryLabel(t, tpl.category) : undefined}>
      {missing ? (
        <View style={s.pad}>
          {q.error && (q.error as { status?: number }).status === 404
            ? <EmptyState icon="file-minus" title={t("dcat.notFound")} text={t("dcat.notFoundText")} actionLabel={t("dcat.toCatalog")} onAction={() => router.replace("/(tabs)/services")} />
            : <ErrorView error={q.error} onRetry={() => void q.refetch()} />}
        </View>
      ) : !tpl ? (
        <View style={s.pad}><Skeleton height={34} round={12} /><Skeleton height={70} round={14} /><Skeleton height={210} round={18} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => { void q.refetch(); void render.refetch(); }} />}
        >
          <Text variant="h2" selectable>{tpl.name}</Text>
          {tpl.description && tpl.description.trim() !== tpl.name.trim() ? <Text variant="small" tone="gray" selectable>{tpl.description}</Text> : null}
          <View style={s.pills}>
            <Pill tone="blue" label={categoryLabel(t, tpl.category)} />
            {tpl.language ? <Pill tone="gray" label={languageLabel(t, tpl.language)} /> : null}
            {tpl.price > 0 ? <Pill tone="ok" label={t("dcat.priceSum", { price: fmtMoney(tpl.price) })} /> : null}
            {tpl.fields ? <Pill tone="gray" label={t("dcat.fieldsN", { n: tpl.fields })} /> : null}
          </View>
          {clean.planSeen ? (
            <Card style={[s.plan, { borderColor: c.warn, backgroundColor: c.warnBg }]}>
              <Text variant="body" weight="bold">{t("dcat.planNoteTitle")}</Text>
              <Text variant="small" tone="gray">{t("dcat.planNoteText")}</Text>
              <Button title={t("dcat.planChoose")} icon="award" variant="gradient" full onPress={() => router.push("/subscription" as never)} />
            </Card>
          ) : null}
          {actions.length ? <Text variant="h4">{t("dcat.whatNext")}</Text> : null}
          <TemplateActions actions={actions} />
          <TemplatePreview kicker={categoryLabel(t, tpl.category)} text={text} loading={render.isLoading} error={render.error} onRetry={() => void render.refetch()} open={full} onOpen={() => { setFull(true); trackDoc("document_preview_opened", { category: tpl.category, language: tpl.language }); }} onClose={() => setFull(false)} title={tpl.name} />
        </ScrollView>
      )}
      <TemplateGates gates={clean.gates} />
    </AdminPage>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, gap: 12 },
  content: { paddingHorizontal: 16, paddingTop: 6, gap: 14 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  plan: { gap: 10, padding: 14, borderWidth: 1.5, borderRadius: radius.rl },
});
