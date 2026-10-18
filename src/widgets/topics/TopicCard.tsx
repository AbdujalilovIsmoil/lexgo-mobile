import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Card, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { Topic } from "./topicsData";

// One situation card: gradient icon, title, short description.
export function TopicCard({ topic, index, onPress }: { topic: Topic; index: number; onPress: () => void }) {
  const { t } = useT();
  return (
    <Animated.View entering={FadeInUp.delay(index * 70).duration(380)} style={s.cell}>
      <Card onPress={onPress} style={s.card}>
        <LinearGradient colors={topic.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.icon}>
          <Icon name={topic.icon} size={20} tone="white" />
        </LinearGradient>
        <Text variant="h4" numberOfLines={1}>{t(`topics.items.${topic.key}.title`)}</Text>
        <Text variant="caption" tone="gray" numberOfLines={2}>{t(`topics.items.${topic.key}.desc`)}</Text>
      </Card>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  cell: { flex: 1 },
  card: { flex: 1, gap: 4, padding: 14, minHeight: 132 },
  icon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginBottom: 8 },
});
