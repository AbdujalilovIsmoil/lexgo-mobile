import { StyleSheet, View } from "react-native";
import type { OnbState } from "@/entities/pro-onboarding";
import { radius, useColors } from "@/shared/theme";
import { Card, Icon, Pill, Text, type IconName, type PillTone } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { state: OnbState; percent: number; done: number; total: number; reason: string };

const LOOK: Record<OnbState, { icon: IconName; tone: PillTone }> = {
  incomplete: { icon: "edit-3", tone: "warn" },
  ready: { icon: "send", tone: "blue" },
  submitted: { icon: "clock", tone: "blue" },
  approved: { icon: "check-circle", tone: "ok" },
  rejected: { icon: "x-circle", tone: "err" },
};

// The seller's review state: pending / approved / rejected (+ the reason), and what it means for selling (TZ 31).
export function OnboardingStatusCard({ state, percent, done, total, reason }: Props) {
  const { t } = useT();
  const c = useColors();
  const look = LOOK[state];
  const color = { warn: c.warn, blue: c.accent, ok: c.ok, err: c.err, cy: c.accent, gray: c.gray, glass: c.gray }[look.tone];
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <View style={[s.icon, { backgroundColor: `${color}22` }]}><Icon name={look.icon} size={24} color={color} /></View>
        <View style={s.col}>
          <Text variant="h4">{t(`sl1.state.${state}`)}</Text>
          <Pill label={t(`sl1.badge.${state}`)} tone={look.tone} small />
        </View>
      </View>
      <Text variant="small" tone="gray">{t(`sl1.stateText.${state}`)}</Text>
      {state === "rejected" && reason ? <Text variant="small" tone="err">{t("sl2.reason", { text: reason })}</Text> : null}
      {total > 0 ? (
        <View style={s.bar}>
          <ProgressBar value={percent / 100} color={color} />
          <Text variant="caption" tone="gray">{t("sl2.progress", { done, total })}</Text>
        </View>
      ) : null}
      {state !== "approved" ? (
        <View style={[s.note, { backgroundColor: c.warnBg }]}>
          <Icon name="eye-off" size={16} color={c.warn} />
          <Text variant="caption" style={[s.noteText, { color: c.warn }]}>{t("sl1.notPublic")}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 50, height: 50, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 4 },
  bar: { gap: 6 },
  note: { flexDirection: "row", gap: 8, padding: 10, borderRadius: radius.sm, alignItems: "flex-start" },
  noteText: { flex: 1 },
});
