import { StyleSheet, View } from "react-native";
import { heroKind, type HeroKind, type OnbState } from "@/entities/pro-onboarding";
import { radius, useColors } from "@/shared/theme";
import { Card, Icon, Pill, Text, type IconName, type PillTone } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ProgressRing } from "./ProgressRing";

type Props = { state: OnbState; percent: number; done: number; total: number; reason: string; nextTitle?: string };

const LOOK: Record<HeroKind, { icon: IconName; tone: PillTone }> = {
  fresh: { icon: "flag", tone: "blue" },
  progress: { icon: "edit-3", tone: "warn" },
  ready: { icon: "send", tone: "blue" },
  submitted: { icon: "clock", tone: "blue" },
  approved: { icon: "check-circle", tone: "ok" },
  rejected: { icon: "x-circle", tone: "err" },
};

// Status hero: a progress ring and, by the review state, a title, a pill and one line saying what to do next (TZ 31).
export function OnboardingStatusCard({ state, percent, done, total, reason, nextTitle }: Props) {
  const { t } = useT();
  const c = useColors();
  const kind = heroKind(state, done);
  const look = LOOK[kind];
  const color = { ok: c.ok, err: c.err, warn: c.warn, blue: c.accent, cy: c.accent, gray: c.gray, glass: c.gray }[look.tone];
  const title = kind === "fresh" ? t("onbUx.freshTitle") : t(`sl1.state.${state}`);
  const hint =
    kind === "fresh" ? t("onbUx.freshHint")
    : kind === "progress" ? (nextTitle ? t("onbUx.next", { step: nextTitle }) : t("onbUx.progressHint"))
    : kind === "ready" ? t("onbUx.readyHint")
    : kind === "approved" ? t("onbUx.approvedNote")
    : t(`sl1.stateText.${state}`);
  const approved = kind === "approved";
  return (
    <Card style={[s.card, approved && { backgroundColor: c.okBg, borderColor: c.okBg }]}>
      <View style={s.row}>
        <ProgressRing value={approved ? 1 : percent / 100} color={color} label={t("onbUx.ringA11y", { pct: approved ? 100 : percent })}>
          {approved ? <Icon name="check" size={34} color={c.ok} /> : <Text variant="h3">{`${percent}%`}</Text>}
        </ProgressRing>
        <View style={s.col}>
          <Pill label={t(`sl1.badge.${state}`)} tone={look.tone} icon={look.icon} small />
          <Text variant="h3" numberOfLines={2}>{title}</Text>
          <Text variant="small" tone="gray" numberOfLines={3}>{hint}</Text>
          {total > 0 && !approved ? <Text variant="caption" tone="gray2">{t("sl2.progress", { done, total })}</Text> : null}
        </View>
      </View>
      {kind === "rejected" && reason ? (
        <View style={[s.note, { backgroundColor: c.errBg }]}>
          <Icon name="message-square" size={16} color={c.err} />
          <Text variant="small" style={[s.noteText, { color: c.err }]}>{t("sl2.reason", { text: reason })}</Text>
        </View>
      ) : null}
      {!approved ? (
        <View style={[s.note, { backgroundColor: c.surface2 }]}>
          <Icon name="eye-off" size={16} tone="gray" />
          <Text variant="caption" tone="gray" style={s.noteText}>{t("sl1.notPublic")}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  col: { flex: 1, gap: 5 },
  note: { flexDirection: "row", gap: 8, padding: 10, borderRadius: radius.sm, alignItems: "flex-start" },
  noteText: { flex: 1 },
});
