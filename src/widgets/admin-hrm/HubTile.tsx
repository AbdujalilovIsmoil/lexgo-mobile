import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { HrmNavItem } from "@/entities/admin-hrm";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { lighten } from "@/shared/lib/color";
import { tapHaptic } from "@/shared/lib/haptics";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { Grid } from "@/shared/lib/useGrid";

type Props = { item: HrmNavItem; badge?: number; index: number; width: number; move?: Grid["move"] };

// Launcher tile: glossy gradient icon with a red count badge, the section name under it.
export function HubTile({ item, badge, index, width, move }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const go = () => { tapHaptic(); router.push(`/manage/internal/${item.key}` as never); };
  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index, 8) * 35).duration(240)} layout={move} style={{ width }}>
      <PressableScale onPress={go} scale={0.93} accessibilityRole="button" accessibilityLabel={t(`admHrm.nav.${item.key}`)} style={[s.tile, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        <View>
          <LinearGradient colors={[item.color, lighten(item.color)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.icon}><Icon name={item.icon} size={24} tone="white" /></LinearGradient>
          {badge ? <View style={s.badge}><Text variant="caption" weight="bold" style={s.badgeText}>{badge > 99 ? "99+" : badge}</Text></View> : null}
        </View>
        <Text variant="caption" weight="bold" center numberOfLines={2} style={s.label}>{t(`admHrm.nav.${item.key}`)}</Text>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  tile: { alignItems: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 6, borderRadius: 22, borderWidth: 1.5, height: 112 },
  icon: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -6, right: -8, minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 11 },
  label: { lineHeight: 15 },
});
