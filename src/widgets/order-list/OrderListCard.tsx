import { StyleSheet, View } from "react-native";
import { Calendar, Check, CircleCheck, CircleX, Clock, Coins, LoaderCircle, User, type LucideIcon } from "lucide-react-native";
import { orderPhase, type MarketOrder, type MarketStage } from "@/entities/order";
import { phaseStep } from "@/entities/market-flow";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { brand, radius, shadows, useTheme } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";

const STEPS = ["request", "confirm", "work", "done"] as const;
export const STAGE_ICON: Record<MarketStage, LucideIcon> = { pending: Clock, active: LoaderCircle, completed: CircleCheck, cancelled: CircleX };

type Props = { order: MarketOrder; stage: MarketStage; onPress: () => void };

// One purchase: the ADV number and the title with the status badge, the progress line (every order but a stopped one), then the
// specialist, the date and the price.
export function OrderListCard({ order: o, stage, onPress }: Props) {
  const { t, locale } = useT();
  const { colors: c, dark, glass } = useTheme();
  const phase = orderPhase(o);
  const step = phaseStep(phase); // -1: cancelled / refunded, no line
  const tone = { pending: { bg: c.warnBg, fg: c.warn }, active: { bg: c.tint2, fg: c.accent }, completed: { bg: c.okBg, fg: c.ok }, cancelled: { bg: c.errBg, fg: c.err } }[stage];
  const StageGlyph = STAGE_ICON[stage];
  const priceColor = stage === "pending" ? c.warn : stage === "active" ? c.accent : c.ink;
  const date = fmtDate(o.createdAt, locale);
  return (
    <PressableScale
      onPress={onPress}
      scale={0.98}
      accessibilityRole="button"
      accessibilityLabel={[o.workId, o.serviceTitle, t(`mf.phase.${phase}`)].filter(Boolean).join(", ")}
      style={[s.card, !glass && shadows.s1, { backgroundColor: dark ? c.surface : brand.white, borderColor: c.line }]}
    >
      <View style={s.head}>
        <View style={s.titles}>
          {o.workId ? <Text variant="caption" weight="bold" tone="gray" numberOfLines={1} style={s.code}>{o.workId}</Text> : null}
          <Text variant="h4" numberOfLines={2} style={s.title}>{o.serviceTitle || "—"}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: tone.bg }]}>
          <StageGlyph size={13} color={tone.fg} strokeWidth={2.2} />
          <Text variant="caption" weight="bold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} maxFontSizeMultiplier={1} style={[s.badgeText, { color: tone.fg }]}>{t(`mf.phase.${phase}`)}</Text>
        </View>
      </View>
      {step >= 0 ? <Steps at={step} color={tone.fg} /> : null}
      <View style={[s.rule, { backgroundColor: c.line }]} />
      <View style={s.foot}>
        {o.lawyerName ? (
          <View style={[s.fact, s.shrink]}>
            <User size={14} color={c.gray} />
            <Text variant="caption" tone="gray" numberOfLines={1} style={[s.meta, s.shrink]}>{o.lawyerName}</Text>
          </View>
        ) : null}
        {o.lawyerName && date ? <View style={[s.sep, { backgroundColor: c.line }]} /> : null}
        {date ? (
          <View style={s.fact}>
            <Calendar size={14} color={c.gray} />
            <Text variant="caption" tone="gray" numberOfLines={1} style={s.meta}>{date}</Text>
          </View>
        ) : null}
        {o.price ? (
          <View style={[s.fact, s.price]}>
            <Coins size={14} color={priceColor} />
            <Text variant="small" weight="bold" numberOfLines={1} style={[s.priceText, { color: priceColor }]}>{fmtMoney(o.price)} {t("common.currency")}</Text>
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const LABEL_AT = [{ flex: 1, textAlign: "left" }, { flex: 2, textAlign: "center" }, { flex: 2, textAlign: "center" }, { flex: 1, textAlign: "right" }] as const;

// Request → payment → work → done as rings on a line (phaseStep: 4 = all done): the passed ones carry a check, the current one a thick ring.
function Steps({ at, color }: { at: number; color: string }) {
  const { t } = useT();
  const { colors: c } = useTheme();
  return (
    <View style={s.steps}>
      <View style={s.track}>
        {STEPS.map((k, i) => {
          const done = i < at;
          const now = i === at;
          return [
            i > 0 ? <View key={`${k}-seg`} style={[s.seg, { backgroundColor: done || now ? color : c.line }]} /> : null,
            <View key={k} style={[s.dot, { borderColor: done || now ? color : c.line, borderWidth: now ? 3 : 2, backgroundColor: c.surface }]}>
              {done ? <Check size={10} color={color} strokeWidth={3.2} /> : null}
            </View>,
          ];
        })}
      </View>
      <View style={s.labels}>
        {STEPS.map((k, i) => (
          <Text key={k} variant="caption" weight={i <= at ? "semibold" : "regular"} numberOfLines={1} style={[s.stepText, LABEL_AT[i], { color: i <= at ? color : c.gray2 }]}>{t(`mk4.steps.${k}`)}</Text>
        ))}
      </View>
    </View>
  );
}

const DOT = 18;

const s = StyleSheet.create({
  card: { padding: 14, gap: 12, borderRadius: radius.rl, borderWidth: StyleSheet.hairlineWidth },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  titles: { flex: 1, minWidth: 0, gap: 2 },
  code: { fontSize: 11, lineHeight: 14 },
  title: { fontSize: 14, lineHeight: 19 },
  // One width for every status: a long one shrinks its text (adjustsFontSizeToFit) instead of widening the badge.
  badge: { flexDirection: "row", alignItems: "center", gap: 5, width: 120, height: 28, paddingHorizontal: 10, borderRadius: radius.pill },
  badgeText: { fontSize: 11, flex: 1, textAlign: "center" },
  rule: { height: StyleSheet.hairlineWidth },
  foot: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: -2 },
  fact: { flexDirection: "row", alignItems: "center", gap: 5 },
  meta: { fontSize: 11, lineHeight: 14 },
  priceText: { fontSize: 13, lineHeight: 17 },
  shrink: { flexShrink: 1, minWidth: 0 },
  sep: { width: StyleSheet.hairlineWidth, height: 18 },
  price: { marginLeft: "auto", paddingLeft: 6 },
  steps: { gap: 6 },
  track: { flexDirection: "row", alignItems: "center" },
  seg: { flex: 1, height: 2 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, alignItems: "center", justifyContent: "center" },
  labels: { flexDirection: "row" },
  stepText: { fontSize: 11, lineHeight: 14 },
});
