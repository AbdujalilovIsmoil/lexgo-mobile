import { useState } from "react";
import { StyleSheet } from "react-native";
import { REGION_KEYS } from "@/entities/admin-dash";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { OptionSheet } from "@/shared/ui/admin";

// Region filter: a field that opens the list of regions in a drawer ("" = all regions).
export function RegionButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  const options = [{ value: "", label: t("admDash.filter.allRegions") }, ...REGION_KEYS.map((k) => ({ value: k, label: t(`admDash.region.${k}`) }))];
  return (
    <>
      <PressableScale onPress={() => setOpen(true)} style={[s.box, { borderColor: value ? c.accent : c.line, backgroundColor: value ? c.tint : c.surface }]}>
        <Icon name="map-pin" size={17} tone={value ? "accent" : "gray"} />
        <Text variant="small" weight="semibold" numberOfLines={1} style={s.text}>{options.find((o) => o.value === value)?.label}</Text>
        <Icon name="chevron-down" size={17} tone="gray" />
      </PressableScale>
      <OptionSheet visible={open} onClose={() => setOpen(false)} title={t("admDash.filter.region")} options={options} value={value} onPick={onChange} />
    </>
  );
}

const s = StyleSheet.create({
  box: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minHeight: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  text: { flex: 1 },
});
