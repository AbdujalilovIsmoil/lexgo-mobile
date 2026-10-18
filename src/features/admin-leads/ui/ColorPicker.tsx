import { View } from "react-native";
import { useColors } from "@/shared/theme";
import { Input, PressableScale } from "@/shared/ui";
import { Field } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { STATUS_COLORS, isHex } from "../model/columnKey";

// Status colour: eight presets plus a free #RRGGBB field.
export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <Field label={t("admLeadsC.statusColor")}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {STATUS_COLORS.map((col) => (
          <PressableScale key={col} onPress={() => onChange(col)} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: col, borderWidth: 3, borderColor: value.toLowerCase() === col ? c.ink : "transparent" }}>
            <View />
          </PressableScale>
        ))}
      </View>
      <Input value={value} onChangeText={(v) => onChange(v.startsWith("#") ? v : `#${v}`)} maxLength={7} autoCapitalize="none" autoCorrect={false} error={isHex(value) ? undefined : " "} />
    </Field>
  );
}
