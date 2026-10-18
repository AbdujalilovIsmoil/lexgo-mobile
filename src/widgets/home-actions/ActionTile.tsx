import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { QuickAction } from "./actions";

// One quick action: a glossy gradient bubble with the label under it (story-rail style).
export function ActionTile({ action, index, onPress }: { action: QuickAction; index: number; onPress: () => void }) {
  const { t } = useT();
  const label = action.label ?? t(`cl6.actions.${action.key}`);
  return (
    <Animated.View entering={FadeInRight.delay(index * 45).duration(340)}>
      <PressableScale onPress={onPress} scale={0.9} style={s.item} accessibilityRole="button" accessibilityLabel={label}>
        <LinearGradient colors={action.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.bubble}>
          <View style={s.shine} pointerEvents="none" />
          <Icon name={action.icon} size={26} tone="white" />
        </LinearGradient>
        <Text variant="caption" weight="semibold" center numberOfLines={2} style={s.label}>{label}</Text>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  item: { width: 78, alignItems: "center", gap: 8 },
  bubble: { width: 64, height: 64, borderRadius: 22, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  shine: { position: "absolute", top: -18, left: -10, width: 64, height: 40, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.22)" },
  label: { lineHeight: 15 },
});
