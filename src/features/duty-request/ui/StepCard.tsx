import { useEffect, useRef, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { Card, Icon, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useFormScroll } from "./FormFrame";

type Props = { n: number; title: string; caption?: string; done?: boolean; error?: boolean; attempt?: number; children: ReactNode };

// One numbered step of the request form. The number turns into a green tick once the step is satisfied; a refused
// step gets a red outline and the frame scrolls to it (on every refused press, not only the first).
export function StepCard({ n, title, caption, done, error, attempt = 0, children }: Props) {
  const c = useColors();
  const scrollTo = useFormScroll();
  const y = useRef(0);
  useEffect(() => {
    if (error) scrollTo(Math.max(0, y.current - 12));
  }, [error, attempt, scrollTo]);
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(n, 5) * 50).duration(320)} onLayout={(e) => { y.current = e.nativeEvent.layout.y; }}>
      <Card style={[s.card, error && { borderColor: c.err, borderWidth: 1.5 }]}>
        <View style={s.head}>
          {done ? (
            <Animated.View key="ok" entering={ZoomIn.springify().damping(14)} style={[s.badge, { backgroundColor: c.ok }]}><Icon name="check" size={16} color="#FFFFFF" /></Animated.View>
          ) : (
            <View style={[s.badge, { backgroundColor: error ? c.errBg : c.tint2 }]}><Text variant="small" weight="bold" style={{ color: error ? c.err : c.accent }}>{n}</Text></View>
          )}
          <View style={s.col}>
            <Text variant="h4">{title}</Text>
            {caption ? <Text variant="caption" tone="gray">{caption}</Text> : null}
          </View>
        </View>
        {children}
      </Card>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { gap: 14, borderRadius: radius.rl },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
});
