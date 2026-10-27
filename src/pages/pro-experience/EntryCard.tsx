import { StyleSheet, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelExperience, cardOf, EvidenceList, evidenceFile, expKeys, resultLabel, stageLabel, type ExpGroup, type ExpNote, type ExpRecord } from "@/entities/pro-experience";
import { Button, Card, confirmDialog, Icon, Text, toast, useErrorText } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { fmtDate } from "@/shared/lib/format";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { PositionChanges, PositionList } from "./PositionList";
import { StatePill } from "./StatePill";

type Props = { g: ExpGroup; category: (r: ExpRecord) => string; onEdit: (base: ExpRecord) => void; onHistory: () => void };

// One experience entry (Gaps Closed §3.5–3.7, §3.14): the verified data with its pill and what it is made of (stages, results, the files,
// which open), a newer revision beside it as a note, and whether it counts for the price. Withdrawing a revision under review asks first.
export function EntryCard({ g, category, onEdit, onHistory }: Props) {
  const { t } = useT();
  const c = useColors();
  const qc = useQueryClient();
  const errText = useErrorText();
  const cancel = useMutation({
    mutationFn: (id: string) => cancelExperience(id),
    onSuccess: () => { successHaptic(); toast(t("mf.exp.cancelled"), "ok"); },
    onError: (e) => { errorHaptic(); toast(errText(e), "err"); },
    onSettled: () => void qc.invalidateQueries({ queryKey: expKeys.all }),
  });
  const card = cardOf(g);
  if (!card) return null;
  const { shown, state, note, pendingId } = card;
  const askCancel = () =>
    confirmDialog({ title: t("pxp.cancel.title"), message: t(g.current ? "pxp.cancel.edit" : "pxp.cancel.new"), confirmLabel: t("pxp.cancel.ok"), cancelLabel: t("pxp.cancel.no"), icon: "x-circle", danger: true, onConfirm: () => cancel.mutate(pendingId) });
  const counts = state === "approved" && shown.affectsPricing;
  const files = shown.evidence.map((e, i) => ({ key: e.id, name: e.fileName || t("pxp.ev.file", { n: i + 1 }), file: evidenceFile(e) }));
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="small" weight="bold" tone="accent" style={s.flex}>{category(shown) || "—"}</Text>
        <StatePill state={state} years={shown.years} />
      </View>
      <Text variant="body" weight="bold">{shown.workplace || "—"}</Text>
      <PositionList list={shown.positions} big />
      {shown.description ? <Text variant="small" numberOfLines={4}>{shown.description}</Text> : null}
      {shown.stages.length ? <Line label={t("mf.exp.stages")} text={shown.stages.map((k) => stageLabel(k, t)).join(", ")} /> : null}
      {shown.results.length ? <Line label={t("mf.exp.results")} text={shown.results.map((k) => resultLabel(k, t)).join(", ")} /> : null}
      <EvidenceList rows={files} />
      {state === "rejected" && shown.rejectionReason ? <View style={[s.note, { backgroundColor: c.errBg }]}><Text variant="caption" tone="err">{t("mf.exp.reason", { text: shown.rejectionReason })}</Text></View> : null}
      {note ? <NoteBox note={note} onFix={() => onEdit(note.record)} /> : null}
      {state !== "approved" || counts ? (
        <View style={s.price}>
          <Icon name={counts ? "check-circle" : "info"} size={14} color={counts ? c.ok : c.gray} />
          <Text variant="caption" tone={counts ? "ok" : "gray"} style={s.flex}>{t(counts ? "pxp.price.counts" : "pxp.price.not")}</Text>
        </View>
      ) : null}
      <View style={s.actions}>
        {pendingId ? (
          <Button title={t("mf.exp.cancelPending")} icon="x" variant="line" size="sm" loading={cancel.isPending} onPress={askCancel} />
        ) : (
          <Button title={g.current ? t("mf.exp.edit") : state === "rejected" ? t("pxp.act.fix") : t("pxp.act.resend")} icon={g.current ? "edit-2" : "rotate-ccw"} variant="soft" size="sm" onPress={() => onEdit(g.current ?? shown)} />
        )}
        <Button title={t("pxp.act.history")} icon="clock" variant="ghost" size="sm" onPress={onHistory} />
      </View>
    </Card>
  );
}

function Line({ label, text }: { label: string; text: string }) {
  return (
    <Text variant="caption" tone="gray">
      <Text variant="caption" weight="semibold" tone="gray">{`${label}: `}</Text>
      {text}
    </Text>
  );
}

// The edit next to the verified data: under review (it does not count yet), rejected (with the reason and a way to fix it) or withdrawn.
function NoteBox({ note, onFix }: { note: ExpNote; onFix: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const r = note.record;
  const look = { pending: [c.warnBg, "warn"], rejected: [c.errBg, "err"], cancelled: [c.surface2, "gray"] } as const;
  const [bg, tone] = look[note.kind];
  const meta = [r.version != null ? t("pxp.note.version", { n: r.version }) : "", r.submittedAt ? fmtDate(r.submittedAt, locale) : ""].filter(Boolean).join(" · ");
  return (
    <View style={[s.note, { backgroundColor: bg }]}>
      <Text variant="small" weight="bold" tone={tone}>{[t(`pxp.note.${note.kind}`), meta].filter(Boolean).join(" · ")}</Text>
      {note.changed.length ? <Text variant="caption" tone="gray">{t("pxp.note.changed", { list: note.changed.map((k) => t(`pxp.field.${k}`)).join(", ") })}</Text> : null}
      <PositionChanges diff={note.positions} />
      {note.kind === "rejected" && r.rejectionReason ? <Text variant="caption" tone="err">{t("mf.exp.reason", { text: r.rejectionReason })}</Text> : null}
      <Text variant="caption" tone="gray">{t(note.kind === "pending" ? "pxp.note.pendingText" : "pxp.note.keeps")}</Text>
      {note.kind === "rejected" ? <Button title={t("pxp.act.fix")} icon="tool" variant="soft" size="sm" onPress={onFix} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  note: { padding: 10, borderRadius: 12, gap: 4 },
  price: { flexDirection: "row", alignItems: "center", gap: 6 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
