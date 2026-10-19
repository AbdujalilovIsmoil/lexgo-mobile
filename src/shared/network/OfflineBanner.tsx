import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useQueueCount } from "@/shared/cache";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { radius, shadows } from "@/shared/theme";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useNetStore } from "./netStore";

type Look = { icon: IconName; text: string; bg: string };

// A slim pill under the status bar: offline (with the number of unsent writes), server down, slow
// link, and a short "back online" confirmation. Never intercepts touches.
export function OfflineBanner() {
  const { t } = useT();
  const insets = useInsets();
  const queued = useQueueCount();
  const online = useNetStore((s) => s.online);
  const slow = useNetStore((s) => s.slow);
  const down = useNetStore((s) => s.serverDown);
  const restoredAt = useNetStore((s) => s.restoredAt);
  const [seen, setSeen] = useState(restoredAt);
  const [flash, setFlash] = useState(false);
  if (seen !== restoredAt) {
    setSeen(restoredAt);
    setFlash(restoredAt > 0);
  }
  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(false), 2400);
    return () => clearTimeout(id);
  }, [flash]);

  const q = queued > 0 ? ` · ${t("nt3.net.queued", { n: queued })}` : "";
  let look: Look | null = null;
  if (!online) look = { icon: "wifi-off", text: t("nt3.net.offline") + q, bg: "#B42318" };
  else if (down) look = { icon: "server", text: t("nt3.net.serverDown"), bg: "#B42318" };
  else if (slow) look = { icon: "activity", text: t("nt3.net.slow"), bg: "#B54708" };
  else if (queued > 0) look = { icon: "upload-cloud", text: t("nt3.net.syncing", { n: queued }), bg: "#175CD3" };
  else if (flash) look = { icon: "check-circle", text: t("nt3.net.back") + q, bg: "#067647" };
  if (!look) return null;
  return (
    <View pointerEvents="none" style={[s.host, { top: insets.top + 2 }]}>
      <Animated.View key={look.icon} entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(180)} style={[s.pill, { backgroundColor: look.bg }, shadows.s2]} accessibilityLiveRegion="polite">
        <Icon name={look.icon} size={14} color="#fff" />
        <Text variant="caption" weight="semibold" style={s.text} numberOfLines={1}>{look.text}</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  host: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 50 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.pill, maxWidth: "88%" },
  text: { color: "#fff", flexShrink: 1 },
});
