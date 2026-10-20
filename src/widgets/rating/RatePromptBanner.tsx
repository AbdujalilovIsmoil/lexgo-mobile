import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { usePathname } from "expo-router";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { reviewTargetOf, Stars, useOpenWindows, usePendingReviews, type RateTarget } from "@/entities/rating";
import { useIsAuthed } from "@/entities/session";
import { useCountdown, usePromptStore } from "@/features/rating";
import { radius, shadows, useColors } from "@/shared/theme";
import { Avatar, IconButton, PressableScale, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { RateSheet } from "./RateSheet";

// Dismissible prompt shown app-wide while finished work can still be rated: a work with an open 15-minute window
// (countdown from the backend's own seconds) or a finished marketplace job awaiting its review. It names the person to
// rate; a tap opens the rating sheet right here (no page change). Nothing here is decided on the phone.
export function RatePromptBanner() {
  const c = useColors();
  const { t } = useT();
  const insets = useInsets();
  const path = usePathname();
  const authed = useIsAuthed();
  const [pick, setPick] = useState<RateTarget | null>(null);
  const dismissed = usePromptStore((s) => s.dismissed);
  const dismiss = usePromptStore((s) => s.dismiss);
  const win = (useOpenWindows().data ?? []).find((x) => !dismissed.includes(x.workId));
  const rev = (usePendingReviews().data ?? []).find((x) => !dismissed.includes(`review:${x.id}`));
  const cd = useCountdown(win?.window ?? null);
  const item = win && cd.open ? { key: win.workId, target: win, sub: t("py10.rate.left", { time: cd.label }) } : rev ? { key: `review:${rev.id}`, target: reviewTargetOf(rev), sub: t("py10.prompt.review") } : null;
  const hidden = !authed || !item || path.startsWith("/auth") || path.startsWith("/complaints");
  return (
    <>
      {hidden ? null : (
        <Animated.View entering={FadeInDown.duration(260)} exiting={FadeOutUp.duration(200)} style={[s.wrap, { top: insets.top + 8 }]} pointerEvents="box-none">
          <PressableScale onPress={() => setPick(item.target)} style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
            <Avatar name={item.target.lawyerName || "?"} size={40} />
            <View style={s.col}>
              <Text variant="small" weight="bold" numberOfLines={1}>{t("rtx.ask")}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1}>{item.target.lawyerName ? t("rtx.askFor", { name: item.target.lawyerName }) : item.target.title} · {item.sub}</Text>
              <Stars value={0} size={13} />
            </View>
            <IconButton icon="x" size={34} onPress={() => dismiss(item.key)} />
          </PressableScale>
        </Animated.View>
      )}
      <RateSheet target={pick} onClose={() => setPick(null)} />
    </>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 12, right: 12, zIndex: 50 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: radius.rl, borderWidth: 1, ...shadows.s2 },
  col: { flex: 1, gap: 2 },
});
