import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, ZoomIn } from "react-native-reanimated";
import { Icon, PressableScale, Text, Toggle } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useFormScroll } from "./FormFrame";

type Props = { value: boolean; onChange: (v: boolean) => void; error: boolean; attempt?: number };

// The advocate will call the client, so the client agrees explicitly before sending (client-side gate, TZ 14). A pledge
// card, not a form row: icon, short title and one switch; the long text is two lines until "Matnni o'qish" opens it.
// It turns green when agreed; a refused send turns it red, shakes it and scrolls it into view.
export function ConsentRow({ value, onChange, error, attempt = 0 }: Props) {
  const { t } = useT();
  const c = useColors();
  const scrollTo = useFormScroll();
  const y = useRef(0);
  const x = useSharedValue(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!error) return;
    scrollTo(Math.max(0, y.current - 12));
    x.value = withSequence(withTiming(-8, { duration: 60 }), withRepeat(withTiming(8, { duration: 90 }), 4, true), withTiming(0, { duration: 60 }));
  }, [error, attempt, scrollTo, x]);
  const shake = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const tone = value ? c.ok : error ? c.err : c.accent;
  return (
    <Animated.View entering={FadeInDown.delay(250).duration(320)} onLayout={(e) => { y.current = e.nativeEvent.layout.y; }}>
      <Animated.View style={[s.card, { backgroundColor: value ? c.okBg : error ? c.errBg : c.tint, borderColor: value ? c.ok : error ? c.err : c.line }, shake]}>
        <View style={s.top}>
          <Animated.View key={value ? "on" : "off"} entering={ZoomIn.springify().damping(14)} style={[s.tile, { backgroundColor: c.surface }]}>
            <Icon name={value ? "check-circle" : "shield"} size={22} color={tone} />
          </Animated.View>
          <View style={s.col}>
            <Text variant="h4">{t("dm8.consentTitle")}</Text>
            {value ? <Text variant="caption" weight="semibold" style={{ color: c.ok }}>{t("dm8.consentGiven")}</Text> : null}
          </View>
          <Toggle value={value} onChange={onChange} />
        </View>
        <Text variant="small" tone="ink" numberOfLines={open ? undefined : 2}>{t("dm8.consentLabel")}</Text>
        <PressableScale haptic={false} onPress={() => setOpen(!open)} accessibilityRole="button" style={s.more}>
          <Text variant="small" weight="bold" tone="accent">{t(open ? "dm8.consentClose" : "dm8.consentRead")}</Text>
          <Icon name={open ? "chevron-up" : "chevron-down"} size={16} tone="accent" />
        </PressableScale>
        {open || error ? <Text variant="caption" style={{ color: error ? c.err : c.gray }}>{error ? t("dm8.consentRequired") : t("dm8.consentHint")}</Text> : null}
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 16, borderRadius: radius.rl, borderWidth: 1.5 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  tile: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
  more: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", minHeight: 32 },
});
