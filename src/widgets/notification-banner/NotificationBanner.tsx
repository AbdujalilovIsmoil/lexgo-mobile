import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";
import { useQueryClient } from "@tanstack/react-query";
import { alertText, CATEGORY_COLOR, CATEGORY_ICON, linkInputOf, markIdsRead, useBannerStore, useLocalPrefs } from "@/entities/notification";
import { useOpenLink } from "@/features/open-link";
import { useT } from "@/shared/i18n";
import { tapHaptic } from "@/shared/lib/haptics";
import { useInsets } from "@/shared/lib/insets";
import { radius, shadows, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

const SHOW_MS = 5000;

// A new event while the app is open: a card slides down from the top (swipe up or wait to dismiss).
// A tap opens what it is about — role-aware, via the deep-link router — or the notification list.
export function NotificationBanner() {
  const c = useColors();
  const { t } = useT();
  const qc = useQueryClient();
  const insets = useInsets();
  const { open, resolve } = useOpenLink();
  const item = useBannerStore((s) => s.item);
  const hide = useBannerStore((s) => s.hide);
  const vibrate = useLocalPrefs((s) => s.vibrate);
  useEffect(() => {
    if (!item) return;
    if (vibrate) tapHaptic();
    const id = setTimeout(hide, SHOW_MS);
    return () => clearTimeout(id);
  }, [item, hide, vibrate]);
  if (!item) return null;
  const text = alertText(item, t, true);
  const tone = CATEGORY_COLOR[item.category];
  const request = { input: linkInputOf(item) };
  const swipe = Gesture.Pan().runOnJS(true).onEnd((e) => e.translationY < -10 && hide());
  const go = () => {
    hide();
    void markIdsRead(qc, item.ids);
    if (resolve(request).kind === "target") void open(request, "banner");
    else void open({ url: "lexgo:///notifications" }, "banner");
  };
  return (
    <GestureDetector gesture={swipe}>
      <Animated.View key={item.id} accessibilityRole="alert" accessibilityLiveRegion="assertive" entering={SlideInUp.duration(260)} exiting={SlideOutUp.duration(200)} style={[s.host, { top: insets.top + 6 }]}>
        <PressableScale onPress={go} scale={0.99} haptic={false} accessibilityLabel={text.title} style={[s.card, { backgroundColor: c.surface, borderColor: c.line }, shadows.s2]}>
          <View style={[s.icon, { backgroundColor: `${tone}24` }]}><Icon name={CATEGORY_ICON[item.category] as IconName} size={18} color={tone} /></View>
          <View style={s.col}>
            <Text variant="small" weight="bold" numberOfLines={1}>{text.title}</Text>
            {text.body ? <Text variant="caption" tone="gray" numberOfLines={2}>{text.body}</Text> : null}
          </View>
          <Icon name="chevron-right" size={18} tone="gray" />
        </PressableScale>
      </Animated.View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({
  host: { position: "absolute", left: 12, right: 12, zIndex: 100 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.rl, borderWidth: 1 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
});
