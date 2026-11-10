import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { selectHaptic } from "@/shared/lib/haptics";
import { brand, radius, shadows, useTheme } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { tabOffset } from "./model/cards";

type Tab = { id: string; label: string; dot?: string };
type Props = { tabs: Tab[]; value: string; onChange: (id: string) => void };

// The category tabs on top of the services: white pills that float on the page, each with its category's colour. The selected one
// stays white and takes the brand outline and text, and the rail slides to bring it fully into view.
export function CategoryTabs({ tabs, value, onChange }: Props) {
  const { colors: c, dark } = useTheme();
  const rail = useRef<ScrollView>(null);
  const boxes = useRef(new Map<string, { x: number; width: number }>());
  const size = useRef({ view: 0, content: 0 });
  useEffect(() => {
    const box = boxes.current.get(value);
    if (box) rail.current?.scrollTo({ x: tabOffset(box.x, box.width, size.current.view, size.current.content), animated: true });
  }, [value]);
  return (
    <ScrollView
      ref={rail}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={s.rail}
      contentContainerStyle={s.row}
      onLayout={(e) => { size.current.view = e.nativeEvent.layout.width; }}
      onContentSizeChange={(width) => { size.current.content = width; }}
    >
      {tabs.map((x) => {
        const on = value === x.id;
        return (
          <PressableScale
            key={x.id}
            haptic={false}
            scale={0.96}
            onPress={() => { selectHaptic(); onChange(x.id); }}
            onLayout={(e) => { boxes.current.set(x.id, { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width }); }}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[s.tab, shadows.s1, { backgroundColor: dark ? c.surface : brand.white, borderColor: on ? c.accent : "transparent" }]}
          >
            {x.dot ? <View style={[s.dot, { backgroundColor: x.dot }]} /> : null}
            <Text variant="small" weight={on ? "bold" : undefined} numberOfLines={1} style={{ color: on ? c.accent : c.ink }}>{x.label}</Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  rail: { marginHorizontal: -16 },
  row: { gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  tab: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1.5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
