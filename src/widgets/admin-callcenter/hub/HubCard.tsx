import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Card, Icon, Pill, Skeleton, Text, type IconName } from "@/shared/ui";

export type HubCardProps = { icon: IconName; colors: [string, string]; title: string; value?: string; loading?: boolean; note?: string; alert?: string; index?: number; onPress: () => void };

// One entry of the hub: gradient icon, live number, optional red alert pill (e.g. SLA breached).
export function HubCard({ icon, colors, title, value, loading, note, alert, index = 0, onPress }: HubCardProps) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(340)} style={s.cell}>
      <Card onPress={onPress} style={s.card} accessibilityRole="button" accessibilityLabel={title}>
        <View style={s.head}>
          <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.icon}><Icon name={icon} size={18} tone="white" /></LinearGradient>
          <Icon name="arrow-up-right" size={16} tone="gray" />
        </View>
        {loading ? <Skeleton height={28} width="45%" /> : <Text variant="h2" numberOfLines={1}>{value ?? "—"}</Text>}
        <Text variant="small" weight="semibold" numberOfLines={1}>{title}</Text>
        {alert ? <Pill small tone="err" icon="clock" label={alert} /> : note ? <Text variant="caption" tone="gray" numberOfLines={1}>{note}</Text> : null}
      </Card>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  cell: { flex: 1 },
  card: { flex: 1, padding: 14, gap: 4, minHeight: 138 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
