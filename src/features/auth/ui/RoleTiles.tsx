import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { selectHaptic } from "@/shared/lib/haptics";
import { REGISTER_ICONS, REGISTER_ROLES, isSellerRole, type RegisterRole } from "../model/registerRoles";

// Account kind picker: one row of three equal tiles; the chosen kind explains itself below (sellers wait for an admin).
export function RoleTiles({ value, onChange }: { value: RegisterRole; onChange: (r: RegisterRole) => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.wrap}>
      <Text variant="small" tone="gray" style={s.label}>{t("au1.roleLabel")}</Text>
      <View style={s.grid}>
        {REGISTER_ROLES.map((r) => {
          const on = r === value;
          return (
            <PressableScale key={r} haptic={false} onPress={() => { selectHaptic(); onChange(r); }} style={[s.tile, { backgroundColor: on ? c.tint2 : c.surface, borderColor: on ? c.accent : c.line }]}>
              <Icon name={REGISTER_ICONS[r]} size={22} color={on ? c.accent : c.gray} />
              <Text variant="small" weight="bold" tone={on ? "accent" : "ink"} center>{t(`au1.role.${r}`)}</Text>
            </PressableScale>
          );
        })}
      </View>
      <Text variant="caption" tone="gray" style={s.label}>{t(`au1.roleDesc.${value}`)}</Text>
      {isSellerRole(value) ? <Text variant="caption" tone="warn" style={s.label}>{t("au1.sellerNote")}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  label: { marginLeft: 4 },
  grid: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 14, paddingHorizontal: 8, borderRadius: radius.r, borderWidth: 1.5 },
});
