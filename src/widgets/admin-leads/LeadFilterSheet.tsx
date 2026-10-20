import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, Chip, IconButton, SheetOption, SheetScroll, Text } from "@/shared/ui";
import { PeriodPicker, useDateRange } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { EMPTY_FILTER, distinct, leadMatches, regionLabel, scoreLabel, sourceLabel, urgencyLabel, type Lead, type LeadFilter, type Operator } from "@/entities/admin-leads";

type Props = { visible: boolean; onClose: () => void; value: LeadFilter; onApply: (f: LeadFilter) => void; leads: Lead[]; ops: Operator[]; meId: string };
type Key = "score" | "region" | "source" | "urgency";

// Operator, score, region, source, urgency and creation period in one bottom sheet. Nothing is applied until the pinned button
// (it shows how many leads match); "reset" empties every field.
export function LeadFilterSheet({ visible, onClose, value, onApply, leads, ops, meId }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const [d, setD] = useState<LeadFilter>(value);
  const bar = useDateRange("all");
  const [seen, setSeen] = useState(visible);
  if (visible !== seen) {
    setSeen(visible);
    if (visible) {
      setD(value);
      bar.setPreset(value.from || value.to ? "custom" : "all");
      bar.setFrom(value.from);
      bar.setTo(value.to);
    }
  }
  const draft: LeadFilter = { ...d, from: bar.range.from, to: bar.range.to };
  const matched = leads.filter((l) => leadMatches(l, draft, meId)).length;
  const set = (k: keyof LeadFilter, v: string) => setD((x) => ({ ...x, [k]: v }));
  const reset = () => { setD({ ...EMPTY_FILTER, q: d.q }); bar.setPreset("all"); bar.setFrom(""); bar.setTo(""); };
  const apply = () => { onApply(draft); onClose(); };

  const chips = (key: Key, label: string, values: string[], text: (v: string) => string) =>
    values.length ? (
      <View style={s.group}>
        <Text variant="small" tone="gray">{label}</Text>
        <View style={s.chips}>
          <Chip label={t("adm.all")} active={d[key] === ""} onPress={() => set(key, "")} />
          {values.map((v) => <Chip key={v} label={text(v)} active={d[key] === v} onPress={() => set(key, v)} />)}
        </View>
      </View>
    ) : null;
  const people = [{ value: "", label: t("adm.all") }, { value: "mine", label: t("admLeads.mine") }, { value: "unassigned", label: t("admLeads.unassigned") }, ...ops.map((o) => ({ value: o.id, label: o.name || o.phone || o.lexgoId }))];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("adm.filters")} snaps={[0.8, 0.94]}>
      <View style={s.flex}>
        <SheetScroll>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("admLeads.operator")}</Text>
            {people.map((p) => <SheetOption key={p.value} on={d.assignee === p.value} label={p.label} onPress={() => set("assignee", p.value)} />)}
          </View>
          {chips("score", t("admLeads.score"), ["hot", "warm", "cold"], (v) => scoreLabel(t, v))}
          {chips("region", t("admLeads.region"), distinct(leads, (l) => l.region), (v) => regionLabel(t, v))}
          {chips("source", t("admLeads.source"), distinct(leads, (l) => l.source), (v) => sourceLabel(t, v))}
          {chips("urgency", t("admLeads.urgency"), distinct(leads, (l) => l.urgency), (v) => urgencyLabel(t, v))}
          <PeriodPicker bar={bar} label={t("pyx.period")} />
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("adm.reset")} onPress={reset} />
          <Button title={`${t("adm.apply")} · ${matched}`} variant="gradient" full style={s.flex} onPress={apply} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 8, marginBottom: 20 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
