import { StyleSheet, View } from "react-native";
import { SERVICE_STATUSES, STATUS_ICON, statusBg, statusColor, type ServiceStatus } from "@/entities/pro-service";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

type Props = { value: ServiceStatus; onChange: (s: ServiceStatus) => void; disabled?: boolean };

// Faol / Pauzada / Nofaol as three selectable cards: status icon, title and what it means; the selected one has the brand border.
export function StatusCards({ value, onChange, disabled }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.col} accessibilityRole="radiogroup" accessibilityLabel={t("proSvc.statusLabel")}>
      {SERVICE_STATUSES.map((st) => {
        const on = st === value;
        return (
          <PressableScale key={st} disabled={disabled} haptic={false} onPress={() => { selectHaptic(); onChange(st); }} accessibilityRole="radio" accessibilityLabel={t(`proSvc.status.${st}`)} accessibilityHint={t(`proSvc.statusHint.${st}`)} accessibilityState={{ selected: on, disabled: !!disabled }} style={[s.card, { borderColor: on ? c.accent : c.line, backgroundColor: on ? c.tint : c.surface }]}>
            <View style={[s.icon, { backgroundColor: statusBg(c, st) }]}><Icon name={STATUS_ICON[st]} size={18} color={statusColor(c, st)} /></View>
            <View style={s.text}>
              <Text variant="body" weight="bold">{t(`proSvc.status.${st}`)}</Text>
              <Text variant="caption" tone="gray">{t(`proSvc.statusHint.${st}`)}</Text>
            </View>
            <View style={[s.radio, { borderColor: on ? c.accent : c.gray2, backgroundColor: on ? c.accent : "transparent" }]}>{on ? <Icon name="check" size={13} tone="white" /> : null}</View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 8 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, padding: 12, borderRadius: radius.r, borderWidth: 1.5 },
  icon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, gap: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
