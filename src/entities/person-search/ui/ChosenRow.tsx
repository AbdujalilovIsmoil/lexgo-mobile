import { useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInRight, FadeOutLeft, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { Avatar, PressableScale, Icon, Text } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { firstName } from "../lib/selection";
import type { Person } from "../model/usePeople";

// The people picked so far, right under the search field: a horizontal row of avatar chips with a small (x) badge and
// the first name below. Chips and the row itself animate in and out; nothing is rendered while the list is empty.
export function ChosenRow({ list, onRemove }: { list: Person[]; onRemove: (id: string) => void }) {
  const { t } = useT();
  const c = useColors();
  const ref = useRef<ScrollView>(null);
  const was = useRef(0);
  if (!list.length) return null;
  return (
    <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(160)} layout={LinearTransition.duration(200)} style={s.wrap}>
      <Text variant="small" tone="gray" weight="semibold" style={s.count} accessibilityLiveRegion="polite">{t("meetUx.pickedN", { n: list.length })}</Text>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
        onContentSizeChange={() => { if (list.length > was.current) ref.current?.scrollToEnd({ animated: true }); was.current = list.length; }}
      >
        {list.map((p) => {
          const name = p.name || p.phone || "?";
          return (
            <Animated.View key={p.id} entering={FadeInRight.duration(180)} exiting={FadeOutLeft.duration(140)} layout={LinearTransition.duration(180)}>
              <PressableScale haptic={false} scale={0.94} onPress={() => { selectHaptic(); onRemove(p.id); }} accessibilityRole="button" accessibilityLabel={t("meetUx.remove", { name })} hitSlop={4} style={s.chip}>
                <View>
                  <Avatar name={name} size={52} />
                  <View style={[s.badge, { backgroundColor: c.ink, borderColor: c.surface }]}><Icon name="x" size={11} color={c.surface} /></View>
                </View>
                <Text variant="caption" tone="gray" numberOfLines={1} center style={s.name}>{firstName(p)}</Text>
              </PressableScale>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: 10, gap: 6 },
  count: { paddingHorizontal: 18 },
  content: { paddingHorizontal: 14, gap: 4, paddingVertical: 2 },
  chip: { width: 68, alignItems: "center", gap: 4, paddingVertical: 2 },
  badge: { position: "absolute", right: -3, top: -3, width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  name: { width: 64 },
});
