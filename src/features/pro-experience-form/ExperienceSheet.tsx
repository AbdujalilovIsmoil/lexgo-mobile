import { useState } from "react";
import { View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { DESCRIPTION_MIN, EXP_RESULTS, EXP_STAGES, expIssues, expKeys, experienceErrorOf, submitExperience, useExpCategories, type ExpGroup, type ExpInput, type ExpIssue } from "@/entities/pro-experience";
import { Button, DatePickerField, Icon, Input, PressableScale, Text, toast, useErrorText } from "@/shared/ui";
import { FormSheet, MultiChips, SelectField, SwitchField } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { useEvidence } from "./useEvidence";

type Props = { visible: boolean; onClose: () => void; group: ExpGroup | null }; // null = a new entry
const iso = (v: string) => v.slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

// Add or edit one experience entry (TZ §13): category (and an optional direction), workplace and position, the period, what was done,
// the stages and results, and supporting files. Every submission is a new revision for the call center (an edit names the verified one it
// replaces); the verified revision stays in force until the new one is approved.
export function ExperienceSheet({ visible, onClose, group }: Props) {
  // Each opening starts a fresh form for the entry it was opened with; the last one stays drawn while the sheet slides away.
  const [opens, setOpens] = useState(0);
  const [was, setWas] = useState(false);
  const [kept, setKept] = useState<ExpGroup | null>(null);
  if (visible !== was) {
    setWas(visible);
    if (visible) {
      setOpens((n) => n + 1);
      setKept(group);
    }
  }
  if (!opens) return null;
  return <Form key={`${kept?.rootId ?? "new"}:${opens}`} visible={visible} onClose={onClose} group={kept} />;
}

function Form({ visible, onClose, group }: { visible: boolean; onClose: () => void; group: ExpGroup | null }) {
  const editing = group ? group.latest ?? group.current : null;
  const { t } = useT();
  const c = useColors();
  const qc = useQueryClient();
  const errText = useErrorText();
  const cats = useExpCategories();
  const [v, setV] = useState<ExpInput>(() => ({
    sourceId: group?.current?.id ?? "",
    categoryId: editing?.categoryId ?? "",
    subcategoryId: editing?.subcategoryId ?? "",
    workplace: editing?.workplace ?? "",
    position: editing?.position ?? "",
    startedOn: editing?.startedAt ? iso(editing.startedAt) : "",
    endedOn: editing?.endedAt ? iso(editing.endedAt) : "",
    isCurrent: editing ? editing.isCurrent : false,
    description: editing?.description ?? "",
    stages: editing?.stages ?? [],
    results: editing?.results ?? [],
    evidenceIds: [],
  }));
  const ev = useEvidence(editing?.evidence ?? []);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [server, setServer] = useState("");
  const set = (p: Partial<ExpInput>) => setV((cur) => ({ ...cur, ...p }));
  const input = { ...v, evidenceIds: ev.ids };
  const issues = expIssues(input, today());
  const err = (k: ExpIssue) => (tried && issues.includes(k) ? t(`mf.exp.issue.${k}`, { n: DESCRIPTION_MIN }) : undefined);
  const cat = cats.data?.find((x) => x.id === v.categoryId);
  const submit = async () => {
    setTried(true);
    if (issues.length || busy || ev.busy) return;
    setBusy(true);
    setServer("");
    try {
      await submitExperience(input);
      successHaptic();
      toast(t("mf.exp.sent"), "ok");
      void qc.invalidateQueries({ queryKey: expKeys.mine });
      onClose();
    } catch (e) {
      errorHaptic();
      const x = experienceErrorOf(e);
      const key = x ? `mf.exp.err.${x.code}` : "";
      setServer(key && t(key) !== key ? t(key) : errText(e) || t("mf.exp.failed"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <FormSheet visible={visible} onClose={busy ? () => undefined : onClose} title={editing ? t("mf.exp.editTitle") : t("mf.exp.newTitle")} subtitle={editing ? t("mf.exp.editNote") : t("mf.exp.verifyNote")} onSubmit={() => void submit()} submitLabel={t("mf.exp.submit")} submitting={busy} disabled={ev.busy} snaps={[0.9, 0.96]}>
      <SelectField label={t("mf.exp.category")} value={v.categoryId} onChange={(id) => set({ categoryId: id, subcategoryId: "" })} placeholder={t("mf.exp.pickCategory")} error={err("category")} searchable options={(cats.data ?? []).map((x) => ({ value: x.id, label: x.title }))} />
      {cat?.children.length ? <SelectField label={t("mf.exp.subcategory")} value={v.subcategoryId} onChange={(id) => set({ subcategoryId: id })} searchable options={[{ value: "", label: t("mf.exp.anySubcategory") }, ...cat.children.map((x) => ({ value: x.id, label: x.title }))]} /> : null}
      <Input label={t("mf.exp.workplace")} value={v.workplace} onChangeText={(x) => set({ workplace: x })} maxLength={200} error={err("workplace")} />
      <Input label={t("mf.exp.position")} value={v.position} onChangeText={(x) => set({ position: x })} maxLength={200} error={err("position")} />
      <DatePickerField label={t("mf.exp.startedAt")} value={v.startedOn} onChange={(x) => set({ startedOn: x })} max={today()} years error={err("started")} />
      <SwitchField label={t("mf.exp.isCurrent")} value={v.isCurrent} onChange={(x) => set({ isCurrent: x, endedOn: x ? "" : v.endedOn })} />
      {!v.isCurrent ? <DatePickerField label={t("mf.exp.endedAt")} value={v.endedOn} onChange={(x) => set({ endedOn: x })} min={v.startedOn || undefined} max={today()} years error={err("ended")} /> : null}
      <Input label={t("mf.exp.description")} value={v.description} onChangeText={(x) => set({ description: x })} placeholder={t("mf.exp.descriptionPh")} multiline maxLength={4000} style={{ minHeight: 120, textAlignVertical: "top" }} error={err("description") ?? err("contacts")} />
      <Text variant="small" tone="gray" weight="semibold">{t("mf.exp.stages")}</Text>
      <MultiChips options={EXP_STAGES.map((k) => ({ value: k, label: t(`mf.exp.stage.${k}`) }))} value={v.stages} onChange={(x) => set({ stages: x })} />
      <Text variant="small" tone="gray" weight="semibold">{t("mf.exp.results")}</Text>
      <MultiChips options={EXP_RESULTS.map((k) => ({ value: k, label: t(`mf.exp.result.${k}`) }))} value={v.results} onChange={(x) => set({ results: x })} />
      <Text variant="small" tone="gray" weight="semibold">{t("mf.exp.evidence")}</Text>
      {ev.rows.map((r) => (
        <View key={r.key} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, backgroundColor: c.surface2 }}>
          <Icon name={r.busy ? "loader" : "paperclip"} size={16} tone="gray" />
          <Text variant="small" numberOfLines={1} style={{ flex: 1 }}>{r.name}</Text>
          <PressableScale onPress={() => ev.remove(r.key)} hitSlop={8} accessibilityRole="button"><Icon name="x" size={18} tone="gray" /></PressableScale>
        </View>
      ))}
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <Button title={t("mf.exp.addFile")} icon="paperclip" variant="soft" size="sm" onPress={() => void ev.pick(false)} />
        <Button title={t("mf.exp.addPhoto")} icon="image" variant="soft" size="sm" onPress={() => void ev.pick(true)} />
      </View>
      <Text variant="caption" tone="gray2">{t("mf.exp.evidenceHint")}</Text>
      {server ? <Text variant="small" tone="err">{server}</Text> : null}
    </FormSheet>
  );
}
