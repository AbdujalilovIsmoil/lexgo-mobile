import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ACH_TYPES, DESC_MAX, TITLE_MAX, type AchType } from "@/entities/pro-achievements";
import { EvidenceList } from "@/entities/pro-experience";
import { Button, DatePickerField, Input } from "@/shared/ui";
import { Field, FormSheet, SelectField } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";
import { useAchForm } from "./useAchForm";

type Props = { visible: boolean; onClose: () => void };

// Add an achievement (contract §17). Each opening starts an empty form; the last one stays drawn while the sheet slides away.
export function AchievementSheet({ visible, onClose }: Props) {
  const [opens, setOpens] = useState(0);
  const [was, setWas] = useState(false);
  if (visible !== was) {
    setWas(visible);
    if (visible) setOpens((n) => n + 1);
  }
  if (!opens) return null;
  return <Form key={opens} visible={visible} onClose={onClose} />;
}

// Type, title, an optional category, the date, what was achieved and the supporting files. A submission goes to the call center; only an
// approved achievement counts for the rating.
function Form({ visible, onClose }: Props) {
  const { t } = useT();
  const f = useAchForm(onClose);
  const { v, set, err } = f;
  return (
    <FormSheet visible={visible} onClose={f.busy ? () => undefined : onClose} title={t("ach.newTitle")} subtitle={t("ach.verifyNote")} onSubmit={() => void f.submit()} submitLabel={t("ach.submit")} submitting={f.busy} disabled={f.ev.busy} snaps={[0.9, 0.96]} scrollRef={f.scroll}>
      {f.banner ? <Notice tone="err" text={f.banner} /> : null}
      <View onLayout={f.anchor("type")}>
        <SelectField<AchType> label={t("ach.kind")} value={v.type} onChange={(x) => set({ type: x }, "type")} placeholder={t("ach.pickType")} error={err("type")} options={ACH_TYPES.map((k) => ({ value: k, label: t(`ach.type.${k}`) }))} />
      </View>
      <View onLayout={f.anchor("title")}>
        <Input label={t("ach.name")} value={v.title} onChangeText={(x) => set({ title: x }, "title")} maxLength={TITLE_MAX} error={err("title")} />
      </View>
      <View onLayout={f.anchor("category")}>
        <SelectField label={t("ach.category")} value={v.categoryId} onChange={(id) => set({ categoryId: id }, "category")} placeholder={t("ach.anyCategory")} error={err("category")} searchable options={[{ value: "", label: t("ach.anyCategory") }, ...(f.cats.data ?? []).map((x) => ({ value: x.id, label: x.title }))]} />
      </View>
      <View onLayout={f.anchor("date")}>
        <DatePickerField label={t("ach.date")} value={v.achievedOn} onChange={(x) => set({ achievedOn: x }, "date")} max={f.today()} years error={err("date")} />
      </View>
      <View onLayout={f.anchor("description")}>
        <Input label={t("ach.description")} value={v.description} onChangeText={(x) => set({ description: x }, "description")} placeholder={t("ach.descriptionPh")} multiline maxLength={DESC_MAX} style={s.area} error={err("description")} />
      </View>
      <View onLayout={f.anchor("evidence")}>
        <Field label={t("ach.evidence")} error={err("evidence")} hint={t("ach.evidenceHint")}>
          <EvidenceList rows={f.ev.rows} onRemove={(k) => { f.ev.remove(k); f.touch("evidence"); }} />
          <View style={s.buttons}>
            <Button title={t("ach.addFile")} icon="paperclip" variant="soft" size="sm" onPress={() => { f.touch("evidence"); void f.ev.pick(false); }} />
            <Button title={t("ach.addPhoto")} icon="image" variant="soft" size="sm" onPress={() => { f.touch("evidence"); void f.ev.pick(true); }} />
          </View>
        </Field>
      </View>
    </FormSheet>
  );
}

const s = StyleSheet.create({
  area: { minHeight: 120, textAlignVertical: "top" },
  buttons: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
});
