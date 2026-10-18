import { StyleSheet, View } from "react-native";
import { shadows, useColors } from "@/shared/theme";
import { GradientBox, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { focused: boolean; onPress: () => void; labelKey: string; shape?: "circle" | "squircle" };

// The raised centre action (AI). Circle on iOS, rounded square on Android.
export function AiButton({ focused, onPress, labelKey, shape = "circle" }: Props) {
  const c = useColors();
  const { t } = useT();
  const round = shape === "circle" ? 27 : 19;
  return (
    <PressableScale onPress={onPress} scale={0.9} style={s.wrap} accessibilityRole="button" accessibilityState={{ selected: focused }}>
      <View style={[s.ring, { backgroundColor: c.bg, borderRadius: round + 5 }]}>
        <GradientBox round={round} style={[s.btn, shadows.blue]}>
          <Icon name="zap" size={24} tone="white" />
        </GradientBox>
      </View>
      <Text variant="caption" weight={focused ? "bold" : "medium"} style={[s.label, { color: focused ? c.accent : c.gray2 }]}>
        {t(labelKey)}
      </Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", marginTop: -30, gap: 1, paddingBottom: 4 },
  ring: { padding: 5 },
  btn: { width: 54, height: 54, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 10.5 },
});
