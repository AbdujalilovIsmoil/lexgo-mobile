import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { Party } from "../model/useMktFilters";

type Props = { label: string; icon: IconName; value: Party | null; placeholder: string; onOpen: () => void; onClear: () => void };

// A "seller / client" filter: tap to pick, the cross clears it.
export function PartyFilter({ label, icon, value, placeholder, onOpen, onClear }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.wrap}>
      <Text variant="small" tone="gray" style={s.label}>{label}</Text>
      <PressableScale onPress={onOpen} accessibilityLabel={label} style={[s.box, { borderColor: value ? c.accent : c.line, backgroundColor: value ? c.tint : c.surface }]}>
        <Icon name={icon} size={17} tone={value ? "accent" : "gray"} />
        <Text variant="small" weight="semibold" numberOfLines={1} tone={value ? "ink" : "gray2"} style={s.text}>{value?.label ?? placeholder}</Text>
        {value ? <PressableScale onPress={onClear} hitSlop={10} accessibilityLabel={t("adm.reset")}><Icon name="x-circle" size={18} tone="gray" /></PressableScale> : <Icon name="chevron-down" size={17} tone="gray" />}
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, gap: 6 },
  label: { marginLeft: 4 },
  box: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 46, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5 },
  text: { flex: 1 },
});
