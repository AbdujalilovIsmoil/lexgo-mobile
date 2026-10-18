import { View } from "react-native";
import { COMPLAINT_CATEGORIES, CATEGORY_ICON } from "@/entities/rating";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { Field } from "@/shared/ui/admin";
import { brand, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// "Nima bo'ldi?" — the web's .shkf__cat cards: a 34px icon tile (blue with a white icon when chosen),
// the name and a one-line hint, and a radio ring at the top-right corner.
export function CategoryCards({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const { t } = useT();
  const c = useColors();
  return (
    <Field label={t("pwc.catLabel")} error={error}>
      <View style={{ gap: 10 }}>
        {COMPLAINT_CATEGORIES.map((k) => {
          const on = value === k;
          return (
            <PressableScale key={k} onPress={() => onChange(k)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flexDirection: "row", alignItems: "flex-start", gap: 11, padding: 12, paddingRight: 40, borderRadius: 16, borderWidth: on ? 2 : 1.5, borderColor: on ? brand.b600 : error ? c.err : c.line, backgroundColor: on ? c.tint : c.surface }}>
              <View style={{ width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: on ? brand.b600 : c.tint2 }}>
                <Icon name={CATEGORY_ICON[k] ?? "message-circle"} size={17} color={on ? "#FFFFFF" : c.accent} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="small" weight="bold">{t(`py5.cat.${k}`)}</Text>
                <Text variant="caption" tone="gray">{t(`py5.catHint.${k}`)}</Text>
              </View>
              <View style={{ position: "absolute", top: 12, right: 12, width: 18, height: 18, borderRadius: 9, backgroundColor: c.surface, borderWidth: on ? 5 : 1.5, borderColor: on ? brand.b600 : c.line }} />
            </PressableScale>
          );
        })}
      </View>
    </Field>
  );
}
