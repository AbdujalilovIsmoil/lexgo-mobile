import { StyleSheet } from "react-native";
import { useColors } from "@/shared/theme";
import { GradientBox, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { focused: boolean; onPress: () => void; labelKey: string };

// The AI destination: same place and size as its neighbours, but its indicator pill is always filled with the brand gradient.
export function AiButton({ focused, onPress, labelKey }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <PressableScale onPress={onPress} scale={0.94} style={s.item} accessibilityRole="button" accessibilityState={{ selected: focused }}>
      <GradientBox round={16} style={s.pill}>
        <Icon name="zap" size={22} tone="white" />
      </GradientBox>
      <Text variant="caption" weight={focused ? "bold" : "medium"} style={{ color: focused ? c.ink : c.gray, fontSize: 12 }}>
        {t(labelKey)}
      </Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, alignItems: "center", gap: 4, minHeight: 56 },
  pill: { width: 64, height: 32, alignItems: "center", justifyContent: "center" },
});
