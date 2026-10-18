import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useEntitlements, usePlans } from "@/entities/plan";
import { Button, IconButton, PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { NudgeIcon } from "./NudgeIcon";
import { NudgeShine } from "./NudgeShine";
import { useNudgeStore } from "./nudgeStore";
import { AI_SLUG, NUDGES } from "./variants";

const LIGHT = ["#FFF2E6", "#FFF0F3", "#FDEDF6"] as const;
const DARK = ["#33231A", "#331C26", "#2D1B33"] as const;

// Client-only banner under the page header (web GiftNudge): gift / Pro crown / Lite / lawyers, dismissible.
export function GiftNudge({ enabled }: { enabled: boolean }) {
  const { dark } = useTheme();
  const { t } = useT();
  const router = useRouter();
  const { dismissed, picked, dismiss, ensure } = useNudgeStore();
  const plans = usePlans();
  const ent = useEntitlements();
  const ready = enabled && !plans.isLoading && !ent.isLoading;
  const mine = plans.data?.find((p) => AI_SLUG.test(p.slug) && ent.data?.planIds.includes(p.id));
  const keys = NUDGES.filter((v) => !v.hideForPlan?.includes(mine?.slug ?? "lexgo-ai-free")).map((v) => v.key).join(",");
  useEffect(() => { if (ready) ensure(keys.split(",")); }, [ready, keys, ensure]);
  const v = NUDGES.find((x) => x.key === picked);
  if (!ready || dismissed || !v) return null;
  const go = () => router.push(v.href as never);
  return (
    <Animated.View entering={FadeInDown.duration(450)} exiting={FadeOut.duration(200)} style={s.outer}>
      <LinearGradient colors={[...(dark ? DARK : LIGHT)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, { borderColor: dark ? "#4A3329" : "#FBD9C4" }]}>
        <NudgeShine />
        <View style={s.row}>
          <NudgeIcon v={v} />
          <PressableScale style={s.body} onPress={go}>
            <Text variant="small" weight="bold">{t(`cpd.nudge.${v.key}Title`)}</Text>
            <Text variant="caption" tone="gray">{t(`cpd.nudge.${v.key}Text`)}</Text>
          </PressableScale>
          <IconButton icon="x" size={30} onPress={dismiss} label={t("cpd.nudge.dismiss")} />
        </View>
        <Button title={t(`cpd.nudge.${v.key}Cta`)} icon="arrow-right" iconRight variant="gradient" size="sm" full onPress={go} />
      </LinearGradient>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  outer: { marginHorizontal: 16, marginBottom: 12 },
  card: { borderRadius: 18, borderWidth: 1.5, padding: 14, gap: 12, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  body: { flex: 1, gap: 2 },
});
