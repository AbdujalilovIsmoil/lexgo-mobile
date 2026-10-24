import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelExperience, expKeys, useExpCategories, useMyExperience, type ExpGroup, type ExpRecord } from "@/entities/pro-experience";
import { ExperienceSheet } from "@/features/pro-experience-form";
import { Button, Card, EmptyState, Pill, Text, toast, useErrorText } from "@/shared/ui";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { PageScroll } from "@/shared/ui/sel";
import { useColors } from "@/shared/theme";
import { fmtDate } from "@/shared/lib/format";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

// TZ.md §13 "Experience by category" for a yurist / advokat: every entry with the state of its revisions — verified (with the counted
// years), under review (the verified data stays in force meanwhile), rejected (with the reason). Add, edit (a new revision) or withdraw a
// revision under review. Nothing here changes verified prices or ranking until the call center approves it.
export function ExperiencePage() {
  const { t } = useT();
  const q = useMyExperience();
  const cats = useExpCategories();
  const [sheet, setSheet] = useState<{ group: ExpGroup | null } | null>(null);
  const title = (id: string) => cats.data?.find((c) => c.id === id)?.title ?? "";
  const groups = q.data ?? [];
  return (
    <AdminPage title={t("mf.exp.title")} subtitle={t("mf.exp.menu")}>
      <QueryBoundary query={q}>
        <PageScroll onRefresh={() => void q.refetch()} refreshing={q.isRefetching}>
          <Text variant="small" tone="gray">{t("mf.exp.lead")}</Text>
          <Button title={t("mf.exp.add")} icon="plus" variant="gradient" onPress={() => setSheet({ group: null })} style={s.center} />
          {groups.length ? groups.map((g) => <EntryCard key={g.rootId} g={g} category={title} onEdit={() => setSheet({ group: g })} />) : <EmptyState icon="briefcase" title={t("mf.exp.empty")} />}
        </PageScroll>
      </QueryBoundary>
      <ExperienceSheet visible={!!sheet} onClose={() => setSheet(null)} group={sheet?.group ?? null} />
    </AdminPage>
  );
}

function EntryCard({ g, category, onEdit }: { g: ExpGroup; category: (id: string) => string; onEdit: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const qc = useQueryClient();
  const errText = useErrorText();
  const r: ExpRecord | null = g.latest ?? g.current ?? g.pending;
  const cancel = useMutation({
    mutationFn: (id: string) => cancelExperience(id),
    onSuccess: () => { successHaptic(); toast(t("mf.exp.cancelled"), "ok"); void qc.invalidateQueries({ queryKey: expKeys.mine }); },
    onError: (e) => { errorHaptic(); toast(errText(e), "err"); },
  });
  if (!r) return null;
  const shown = g.pending ?? r;
  const dates = `${shown.startedAt ? fmtDate(shown.startedAt, locale) : "—"} – ${shown.isCurrent ? t("mf.exp.now") : shown.endedAt ? fmtDate(shown.endedAt, locale) : "—"}`;
  const pill = g.pending ? <Pill label={t("mf.exp.status.pending")} tone="warn" small />
    : r.status === "rejected" ? <Pill label={t("mf.exp.status.rejected")} tone="err" small />
    : g.current ? <Pill label={g.current.years != null ? t("mf.exp.status.approvedYears", { n: g.current.years }) : t("mf.exp.status.approved")} tone="ok" small />
    : null;
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="small" weight="bold" tone="accent" style={s.flex}>{category(shown.categoryId) || "—"}</Text>
        {pill}
      </View>
      <Text variant="body" weight="bold">{[shown.position, shown.workplace].filter(Boolean).join(" · ")}</Text>
      <Text variant="caption" tone="gray">{dates}</Text>
      {shown.description ? <Text variant="small" numberOfLines={4}>{shown.description}</Text> : null}
      {g.pending && g.current ? <Text variant="caption" tone="gray">{t("mf.exp.pendingKeeps")}</Text> : null}
      {!g.pending && r.status === "rejected" && r.rejectionReason ? <View style={[s.note, { backgroundColor: c.errBg }]}><Text variant="caption" tone="err">{t("mf.exp.reason", { text: r.rejectionReason })}</Text></View> : null}
      {g.pending ? (
        <Button title={t("mf.exp.cancelPending")} icon="x" variant="line" size="sm" loading={cancel.isPending} onPress={() => g.pending && cancel.mutate(g.pending.id)} style={s.start} />
      ) : (
        <Button title={t("mf.exp.edit")} icon="edit-2" variant="soft" size="sm" onPress={onEdit} style={s.start} />
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  center: { alignSelf: "center" },
  card: { gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  note: { padding: 10, borderRadius: 12 },
  start: { alignSelf: "flex-start" },
});
