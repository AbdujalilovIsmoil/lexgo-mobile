import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { checked: boolean; onChange: (v: boolean) => void; error?: boolean; disabled?: boolean };

// "I accept the price policy" card - must be ticked to save a service (the whole card is the 44pt+ target).
export function PolicyCheck({ checked, onChange, error, disabled }: Props) {
  const { t } = useT();
  const c = useColors();
  const bad = error && !checked;
  return (
    <View style={s.col}>
      <PressableScale disabled={disabled} onPress={() => onChange(!checked)} accessibilityRole="checkbox" accessibilityLabel={t("proSvc.policyA11y")} accessibilityHint={t("proSvc.form.policy")} accessibilityState={{ checked, disabled: !!disabled }} style={[s.row, { backgroundColor: c.surface2, borderColor: bad ? c.err : checked ? c.accent : c.line }]}>
        <View style={[s.box, { borderColor: bad ? c.err : checked ? c.accent : c.gray2, backgroundColor: checked ? c.accent : "transparent" }]}>
          {checked ? <Icon name="check" size={16} tone="white" /> : null}
        </View>
        <Text variant="small" style={s.text}>{t("proSvc.form.policy")}</Text>
      </PressableScale>
      {bad ? <Text variant="caption" tone="err" accessibilityRole="alert">{t("proSvc.form.policyRequired")}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 6 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, minHeight: 56, padding: 14, borderRadius: radius.r, borderWidth: 1.5 },
  box: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  text: { flex: 1 },
});
