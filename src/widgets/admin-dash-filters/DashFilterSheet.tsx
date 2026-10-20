import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { REGION_KEYS } from "@/entities/admin-dash";
import { BottomSheet, Button, Chip, IconButton, SheetScroll, Text } from "@/shared/ui";
import { PeriodPicker, useDateRange } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import type { DashFilterState } from "./useDashFilter";

// Region and period of a dashboard in one bottom sheet (the period's "custom" opens a calendar). Nothing changes until the
// pinned button; "reset" empties both.
export function DashFilterSheet({ f, visible, onClose }: { f: DashFilterState; visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const [region, setRegion] = useState(f.region);
  const draft = useDateRange("all");
  const [seen, setSeen] = useState(visible);
  if (visible !== seen) {
    setSeen(visible);
    if (visible) {
      setRegion(f.region);
      draft.setPreset(f.bar.preset);
      draft.setFrom(f.bar.from);
      draft.setTo(f.bar.to);
    }
  }
  const apply = () => {
    f.setRegion(region);
    f.bar.setPreset(draft.preset);
    f.bar.setFrom(draft.from);
    f.bar.setTo(draft.to);
    onClose();
  };
  const reset = () => { setRegion(""); draft.setPreset("all"); draft.setFrom(""); draft.setTo(""); };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[0.8, 0.94]}>
      <View style={s.flex}>
        <SheetScroll>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("admDash.filter.region")}</Text>
            <View style={s.chips}>
              <Chip label={t("admDash.filter.allRegions")} active={region === ""} onPress={() => setRegion("")} />
              {REGION_KEYS.map((k) => <Chip key={k} label={t(`admDash.region.${k}`)} active={region === k} onPress={() => setRegion(k)} />)}
            </View>
          </View>
          <PeriodPicker bar={draft} label={t("pyx.period")} />
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("adm.reset")} onPress={reset} />
          <Button title={t("adm.apply")} variant="gradient" full style={s.flex} onPress={apply} />
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
