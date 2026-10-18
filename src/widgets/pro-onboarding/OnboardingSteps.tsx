import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { stepStates, stepTarget, type OnbStep, type StepStatus } from "@/entities/pro-onboarding";
import { radius, useColors } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { steps: OnbStep[]; onDocs: () => void; notes?: Record<string, string> };

// The server's checklist as a vertical timeline: numbered nodes on a line, one card per step with one short action.
export function OnboardingSteps({ steps, onDocs, notes = {} }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const states = stepStates(steps);
  const label = (k: string, fallback: string) => (t(`sl2.steps.${k}`).startsWith("sl2.") ? fallback || k : t(`sl2.steps.${k}`));
  const line = (st: StepStatus) => t(st === "done" ? "sl2.stepDone" : st === "current" ? "onbUx.nowStep" : st === "todo" ? "sl2.stepRequired" : "sl2.stepOptional");
  return (
    <View style={s.wrap}>
      <Text variant="h4" style={s.title}>{t("sl2.stepsTitle")}</Text>
      {steps.map((st, i) => {
        const status = states[i];
        const target = stepTarget(st.key);
        const muted = status === "optional";
        const title = label(st.key, st.title);
        const go = () => (target?.kind === "docs" ? onDocs() : target?.kind === "route" ? router.push(target.path as never) : undefined);
        const action = status === "done" ? t("onbUx.edit") : st.key === "documents" ? t("sl2.upload") : t("onbUx.start");
        const status_ = (!muted && notes[st.key]) || line(status);
                return (
          <View key={st.key || i} style={s.row}>
            <View style={s.rail}>
              <Node status={status} index={i + 1} label={`${title}, ${line(status)}`} />
              {i < steps.length - 1 ? <View style={[s.line, { backgroundColor: status === "done" ? c.ok : c.line }]} /> : null}
            </View>
            <View style={[s.card, { backgroundColor: c.surface, borderColor: status === "current" ? c.accent : c.line, opacity: muted ? 0.85 : 1 }]}>
              <View style={s.col}>
                <View style={s.titleRow}>
                  <Text variant="body" weight="semibold" numberOfLines={2} style={s.flex}>{title}</Text>
                  {st.required && status !== "done" ? <View accessible accessibilityLabel={t("onbUx.required")} style={[s.req, { backgroundColor: c.warn }]} /> : null}
                </View>
                <Text variant="caption" tone={status === "done" ? "ok" : status === "current" ? "accent" : "gray"} numberOfLines={2}>{status_}</Text>
              </View>
              {target ? <Button title={action} size="sm" variant={status === "current" ? "primary" : status === "done" ? "ghost" : "soft"} onPress={go} style={s.btn} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Node({ status, index, label }: { status: StepStatus; index: number; label: string }) {
  const c = useColors();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (status !== "current") return;
    pulse.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.out(Easing.ease) }), 3, false); // a short call for attention, then still
    return () => cancelAnimation(pulse);
  }, [status, pulse]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 0.7 }] }));
  const bg = status === "done" ? c.ok : status === "current" ? c.accent : c.surface2;
  return (
    <View accessible accessibilityLabel={label} style={s.nodeBox}>
      {status === "current" ? <Animated.View pointerEvents="none" style={[s.pulse, { borderColor: c.accent }, ring]} /> : null}
      <View style={[s.node, { backgroundColor: bg }]}>
        {status === "done" ? <Icon name="check" size={16} color="#FFFFFF" /> : <Text variant="small" weight="bold" style={{ color: status === "current" ? "#FFFFFF" : c.gray }}>{index}</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 0 },
  title: { marginBottom: 10 },
  row: { flexDirection: "row", gap: 12 },
  rail: { width: 32, alignItems: "center" },
  nodeBox: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  node: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  pulse: { position: "absolute", width: 32, height: 32, borderRadius: 16, borderWidth: 2 },
  line: { flex: 1, width: 2, marginVertical: 4, borderRadius: 1 },
  card: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.r, borderWidth: 1, marginBottom: 10, minHeight: 64 },
  col: { flex: 1, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flexShrink: 1 },
  req: { width: 7, height: 7, borderRadius: 4 },
  btn: { minHeight: 44, justifyContent: "center" },
});
