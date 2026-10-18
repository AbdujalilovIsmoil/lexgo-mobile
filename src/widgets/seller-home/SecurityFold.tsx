import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { NotifPrefsCard, TelegramCard, TwoFactorCard } from "@/widgets/security";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Fade } from "./Fade";

// A lawyer's account-security cards (2FA, Telegram, notification switches). They are set once, so only a header row sits on the
// home; a tap unfolds the three cards below it, each a full-width card of its own (not boxed inside another box).
export function SecurityFold({ i }: { i: number }) {
  const { t } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  return (
    <Fade i={i}>
      <View style={s.col}>
        <PressableScale onPress={() => setOpen((v) => !v)} scale={0.99} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={t("shm.sec.title")} style={[s.head, { backgroundColor: c.surface, borderColor: c.line }]}>
          <View style={[s.ico, { backgroundColor: "#8B5CF622" }]}><Icon name="shield" size={18} color="#8B5CF6" /></View>
          <View style={s.txt}>
            <Text variant="h4" numberOfLines={1}>{t("shm.sec.title")}</Text>
            {open ? null : <Text variant="caption" tone="gray" numberOfLines={2}>{t("shm.sec.sum")}</Text>}
          </View>
          <Icon name={open ? "chevron-up" : "chevron-down"} size={20} color={c.gray} />
        </PressableScale>
        {open ? <Animated.View entering={FadeIn.duration(200)} style={s.cards}><TwoFactorCard /><TelegramCard /><NotifPrefsCard /></Animated.View> : null}
      </View>
    </Fade>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: radius.rl, borderWidth: 1 },
  ico: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, gap: 2 },
  cards: { gap: 12 },
});
