import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { AdminModule } from "@/entities/access";
import { useOpenModule } from "@/widgets/admin-drawer";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { lighten } from "@/shared/lib/color";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// One admin section as an app-launcher tile: glossy gradient icon, two-line name. Opening it is remembered.
export function ModuleTile({ mod, index, width }: { mod: AdminModule; index: number; width: number }) {
  const { t } = useT();
  const c = useColors();
  const openModule = useOpenModule();
  const open = () => openModule(mod.key);
  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index, 8) * 40).duration(320)} style={{ width }}>
      <PressableScale onPress={open} scale={0.93} accessibilityRole="button" accessibilityLabel={t(`admHub.mod.${mod.key}.title`)} style={[s.tile, { backgroundColor: c.surface, borderColor: c.line }]}>
        <LinearGradient colors={[mod.color, lighten(mod.color)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.icon}>
          <View style={s.shine} pointerEvents="none" />
          <Icon name={mod.icon} size={24} tone="white" />
        </LinearGradient>
        <Text variant="caption" weight="bold" center numberOfLines={2} style={s.label}>{t(`admHub.mod.${mod.key}.title`)}</Text>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  tile: { alignItems: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 6, borderRadius: 22, borderWidth: 1.5, height: 112 },
  icon: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  shine: { position: "absolute", top: -16, left: -8, width: 56, height: 32, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.22)" },
  label: { lineHeight: 15 },
});
