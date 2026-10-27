import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { hideEnded, useRaStore } from "@/features/remote-assist";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { HEADER_GAP, HEADER_ROW, useInsets } from "@/shared/lib/insets";
import { brand, radius, shadows } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const SHOW_MS = 12_000;

/** The clear terminal message after deny / revoke / end / expiry (TZ RA §17): where the banner was, for twelve seconds or until closed. */
export function EndedNotice() {
  const { t } = useT();
  const insets = useInsets();
  const ended = useRaStore((s) => s.ended);
  const live = useRaStore((s) => !!s.session);
  useEffect(() => {
    if (!ended) return;
    const id = setTimeout(hideEnded, SHOW_MS);
    return () => clearTimeout(id);
  }, [ended]);
  if (!ended || live) return null;
  return (
    <Animated.View entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(160)} pointerEvents="box-none" style={[s.wrap, { top: insets.top + HEADER_GAP + HEADER_ROW + 6 }]}>
      <View style={[s.card, shadows.s2]} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <Icon name="power" size={18} color="#93C6FF" />
        <View style={s.fill}>
          <Text variant="small" weight="bold" tone="white">{t(`ra.ended.${ended.status}`)}</Text>
          <Text variant="caption" style={s.sub}>{t("ra.endedNote")}</Text>
        </View>
        <PressableScale onPress={hideEnded} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("ra.close")} style={s.close}>
          <Icon name="x" size={18} color="#FFFFFF" />
        </PressableScale>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 12, right: 12, alignItems: "center" },
  card: { width: "100%", maxWidth: 560, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: radius.rl, backgroundColor: brand.b900, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", paddingVertical: 10, paddingLeft: 16, paddingRight: 8 },
  fill: { flex: 1, gap: 2 },
  sub: { color: "#B7CDEC" },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
