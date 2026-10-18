import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { PlanFunction } from "../model/types";

// What a plan switches on (GET /subscription-plans `functions`): on/off, with its limit if it has one.
export function PlanFunctions({ items }: { items: PlanFunction[] }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.col}>
      {items.map((f) => {
        const bool = f.unit === "boolean" || f.unit === "";
        const limit = f.enabled && !bool ? (f.limit == null ? t("py3.unlimited") : `${f.limit} ${f.unit}`) : "";
        return (
          <View key={f.key} style={s.row}>
            <Icon name={f.enabled ? "check-circle" : "x-circle"} size={18} color={f.enabled ? c.ok : c.gray2} />
            <View style={s.text}>
              <Text variant="small" weight="semibold" tone={f.enabled ? "ink" : "gray2"}>{f.title}</Text>
              {f.description && f.description !== f.title ? <Text variant="caption" tone="gray">{f.description}</Text> : null}
            </View>
            {limit ? <Text variant="caption" weight="bold" tone="accent">{limit}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  text: { flex: 1, gap: 1 },
});
