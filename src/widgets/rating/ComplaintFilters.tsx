import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useComplaintLabels } from "@/entities/rating";
import type { KindPick, useComplaintFilters } from "@/features/rating";
import { Chip, Icon, PressableScale, Text, singleLineText } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ComplaintFilterSheet } from "./ComplaintFilterSheet";

type F = ReturnType<typeof useComplaintFilters>;

// The search with the filter button (the status lives in its sheet; the button counts what is on), the kinds as chips (all · written by
// you · on quality) when both are there, and the status picked in the sheet as a removable chip. Shown only when it can narrow the list.
export function ComplaintFilters({ f }: { f: F }) {
  const { t } = useT();
  const c = useColors();
  const L = useComplaintLabels();
  const [open, setOpen] = useState(false);
  if (!f.showBar) return null;
  const sheet = f.stages.length > 1;
  const kinds: KindPick[] = ["all", "manual", "quality"];
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <View style={[s.field, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Icon name="search" size={19} tone="gray" />
          <TextInput value={f.q} onChangeText={(v) => f.setQ(v.slice(0, 120))} placeholder={t("pwc.filter.searchPh")} placeholderTextColor={c.gray2} returnKeyType="search" accessibilityLabel={t("pwc.filter.searchPh")} style={[s.input, { color: c.ink }, singleLineText]} />
          {f.q ? <PressableScale onPress={() => f.setQ("")} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("dcat.clearSearch")}><Icon name="x" size={16} tone="gray" /></PressableScale> : null}
        </View>
        {sheet ? (
          <PressableScale onPress={() => setOpen(true)} scale={0.95} accessibilityRole="button" accessibilityLabel={t("dm11.filters")} style={[s.btn, { backgroundColor: c.surface, borderColor: f.stage ? c.accent : c.line }]}>
            <Icon name="sliders" size={20} color={f.stage ? c.accent : c.ink} />
            {f.stage ? <View style={[s.dot, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" tone="white" style={s.dotTx}>1</Text></View> : null}
          </PressableScale>
        ) : null}
      </View>
      {f.bothKinds ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={s.chips}>
          {kinds.map((k) => {
            const sel = f.kind === k;
            return (
              <PressableScale key={k} onPress={() => f.setKind(k)} scale={0.96} accessibilityRole="button" accessibilityState={{ selected: sel }}
                style={[s.chip, sel ? { backgroundColor: c.ink, borderColor: c.ink } : { backgroundColor: c.surface, borderColor: c.line }]}>
                <Text variant="small" weight="semibold" style={{ color: sel ? c.bg : c.ink }}>{t(`pwc.filter.${k}`)}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      ) : null}
      {f.stage ? <View style={s.pad}><Chip label={L.stage(f.stage)} active icon="x" onPress={() => f.setStage("")} /></View> : null}
      <ComplaintFilterSheet f={f} visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginHorizontal: -16, gap: 12, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 54, borderRadius: 18, borderWidth: 1, paddingLeft: 16, paddingRight: 12 },
  input: { flex: 1, minWidth: 0, fontSize: 16, paddingVertical: 12 },
  btn: { width: 54, height: 54, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  dotTx: { fontSize: 10, lineHeight: 12 },
  chips: { gap: 8, paddingHorizontal: 16 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 9 },
  pad: { paddingHorizontal: 16, flexDirection: "row" },
});
