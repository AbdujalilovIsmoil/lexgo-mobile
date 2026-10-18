import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { onboardingState, percentDone, useCabinet, useProgress } from "@/entities/pro-onboarding";
import { useColors } from "@/shared/theme";
import { Card, Icon, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Compact "finish your registration" card for the seller home (Ish maydoni): hidden once the seller is approved.
export function OnboardingBanner() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const cabinet = useCabinet();
  const progress = useProgress();
  const state = onboardingState(cabinet.data, progress.data);
  if (cabinet.isLoading || progress.isLoading || state === "approved" || (cabinet.isError && progress.isError)) return null;
  const p = progress.data;
  return (
    <Card onPress={() => router.push("/pro/onboarding")} style={s.card}>
      <View style={s.row}>
        <Icon name={state === "rejected" ? "x-circle" : state === "submitted" ? "clock" : "clipboard"} size={22} color={state === "rejected" ? c.err : c.warn} />
        <View style={s.col}>
          <Text variant="body" weight="bold">{t(`sl1.state.${state}`)}</Text>
          <Text variant="caption" tone="gray" numberOfLines={2}>{t("sl1.notPublic")}</Text>
        </View>
        <Icon name="chevron-right" size={18} tone="gray" />
      </View>
      {p && p.total > 0 ? <ProgressBar value={percentDone(p) / 100} color={c.warn} /> : null}
      {p && p.total > 0 ? <Text variant="caption" tone="gray">{t("sl2.progress", { done: p.completed, total: p.total })}</Text> : null}
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 8 }, row: { flexDirection: "row", alignItems: "center", gap: 12 }, col: { flex: 1, gap: 2 } });
