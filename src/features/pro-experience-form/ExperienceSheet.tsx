import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { EXP_RESULTS, EXP_STAGES, EvidenceList, type ExpGroup, type ExpRecord } from "@/entities/pro-experience";
import { Button, DatePickerField, Input, Text } from "@/shared/ui";
import { Field, FormSheet, SelectField, SwitchField } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";
import { useExpForm } from "./useExpForm";
import { ValueChips } from "./ValueChips";

// group: the entry (null = a new one); base: the revision the form starts from (null = empty).
type Props = { visible: boolean; onClose: () => void; group: ExpGroup | null; base: ExpRecord | null };

// Add or edit one experience entry (TZ.md Gaps Closed §3): category (and an optional direction), workplace and position, the period, what
// was done, the stages and results, and supporting files. Every submission is a new revision for the call center (an edit names the
// verified one it replaces); the verified revision stays in force until the new one is approved.
export function ExperienceSheet({ visible, onClose, group, base }: Props) {
  // Each opening starts a fresh form for the entry it was opened with; the last one stays drawn while the sheet slides away.
  const [opens, setOpens] = useState(0);
  const [was, setWas] = useState(false);
  const [kept, setKept] = useState<{ group: ExpGroup | null; base: ExpRecord | null }>({ group: null, base: null });
  if (visible !== was) {
    setWas(visible);
    if (visible) {
      setOpens((n) => n + 1);
      setKept({ group, base });
    }
  }
  if (!opens) return null;
  return <Form key={`${kept.group?.rootId ?? "new"}:${opens}`} visible={visible} onClose={onClose} group={kept.group} base={kept.base} />;
}

function Form({ visible, onClose, group, base }: Props) {
  const { t } = useT();
  const f = useExpForm(group, base, onClose);
  const { v, set, err, cat } = f;
  const title = group?.current ? t("mf.exp.editTitle") : base ? t("pxp.act.resend") : t("mf.exp.newTitle");
  // The direction is offered when the category has any, or when the entry holds one the category no longer lists (to be fixed).
  const sub = !!cat && (cat.children.length > 0 || !!v.subcategoryId);
  return (
    <FormSheet visible={visible} onClose={f.busy ? () => undefined : onClose} title={title} subtitle={group?.current ? t("mf.exp.editNote") : t("mf.exp.verifyNote")} onSubmit={() => void f.submit()} submitLabel={t("mf.exp.submit")} submitting={f.busy} disabled={f.ev.busy} snaps={[0.9, 0.96]} scrollRef={f.scroll}>
      {f.banner ? <Notice tone="err" text={f.banner} /> : null}
      {base?.status === "rejected" ? <Notice tone="warn" title={t("pxp.form.fixTitle")} text={base.rejectionReason || t("pxp.form.noReason")} /> : null}
      <View onLayout={f.anchor("category")}>
        <SelectField label={t("mf.exp.category")} value={v.categoryId} onChange={(id) => set({ categoryId: id, subcategoryId: "" }, "category", "subcategory")} placeholder={t("mf.exp.pickCategory")} error={err("category") ?? (sub ? undefined : err("subcategory"))} searchable options={(f.cats.data ?? []).map((x) => ({ value: x.id, label: x.title }))} />
      </View>
      {cat && sub ? (
        <View onLayout={f.anchor("subcategory")}>
          <SelectField label={t("mf.exp.subcategory")} value={v.subcategoryId} onChange={(id) => set({ subcategoryId: id }, "subcategory")} error={err("subcategory")} searchable options={[{ value: "", label: t("mf.exp.anySubcategory") }, ...cat.children.map((x) => ({ value: x.id, label: x.title }))]} />
        </View>
      ) : null}
      <View onLayout={f.anchor("workplace")}>
        <Input label={t("mf.exp.workplace")} value={v.workplace} onChangeText={(x) => set({ workplace: x }, "workplace")} maxLength={200} error={err("workplace")} />
      </View>
      <View onLayout={f.anchor("position")}>
        <Input label={t("mf.exp.position")} value={v.position} onChangeText={(x) => set({ position: x }, "position")} maxLength={200} error={err("position")} />
      </View>
      <View onLayout={f.anchor("started")}>
        <DatePickerField label={t("mf.exp.startedAt")} value={v.startedOn} onChange={(x) => set({ startedOn: x }, "started")} max={f.today()} years error={err("started")} />
      </View>
      <View onLayout={f.anchor("ended")} style={s.group}>
        <SwitchField label={t("mf.exp.isCurrent")} value={v.isCurrent} onChange={(x) => set({ isCurrent: x, endedOn: x ? "" : v.endedOn }, "ended")} />
        {!v.isCurrent ? <DatePickerField label={t("mf.exp.endedAt")} value={v.endedOn} onChange={(x) => set({ endedOn: x }, "ended")} min={v.startedOn || undefined} max={f.today()} years error={err("ended")} /> : null}
        {v.isCurrent && err("ended") ? <Text variant="caption" tone="err" style={s.note}>{err("ended")}</Text> : null}
      </View>
      <View onLayout={f.anchor("description")}>
        <Input label={t("mf.exp.description")} value={v.description} onChangeText={(x) => set({ description: x }, "description")} placeholder={t("mf.exp.descriptionPh")} multiline maxLength={4000} style={s.area} error={err("description")} />
      </View>
      <View onLayout={f.anchor("stages")}>
        <ValueChips label={t("mf.exp.stages")} options={EXP_STAGES.map((k) => ({ value: k, label: t(`mf.exp.stage.${k}`) }))} value={v.stages} onChange={(x) => set({ stages: x }, "stages")} error={err("stages")} />
      </View>
      <View onLayout={f.anchor("results")}>
        <ValueChips label={t("mf.exp.results")} options={EXP_RESULTS.map((k) => ({ value: k, label: t(`mf.exp.result.${k}`) }))} value={v.results} onChange={(x) => set({ results: x }, "results")} error={err("results")} />
      </View>
      <View onLayout={f.anchor("evidence")}>
        <Field label={t("mf.exp.evidence")} error={err("evidence")} hint={t("mf.exp.evidenceHint")}>
          <EvidenceList rows={f.ev.rows} onRemove={(k) => { f.ev.remove(k); f.touch("evidence"); }} />
          <View style={s.buttons}>
            <Button title={t("mf.exp.addFile")} icon="paperclip" variant="soft" size="sm" onPress={() => { f.touch("evidence"); void f.ev.pick(false); }} />
            <Button title={t("mf.exp.addPhoto")} icon="image" variant="soft" size="sm" onPress={() => { f.touch("evidence"); void f.ev.pick(true); }} />
          </View>
        </Field>
      </View>
    </FormSheet>
  );
}

const s = StyleSheet.create({
  group: { gap: 14 },
  note: { marginLeft: 4, marginTop: -8 },
  area: { minHeight: 120, textAlignVertical: "top" },
  buttons: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
});
