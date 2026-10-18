import { View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { FieldCard } from "@/shared/ui/profile";
import { useColors } from "@/shared/theme";

type Fact = { icon: IconName; label: string; value?: string; wide?: boolean };

// Two-column info tiles (icon, label, value); an unset value is shown dim.
export function FactTiles({ facts, unset }: { facts: Fact[]; unset: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {facts.map((f) => (
        <FieldCard key={f.label} style={{ gap: 6, flexGrow: 1, flexBasis: f.wide ? "100%" : "45%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icon name={f.icon} size={14} color={c.accent} />
            <Text variant="caption" tone="gray">{f.label}</Text>
          </View>
          <Text variant="small" weight={f.value ? "bold" : "regular"} tone={f.value ? "ink" : "gray2"} numberOfLines={1}>{f.value || unset}</Text>
        </FieldCard>
      ))}
    </View>
  );
}
