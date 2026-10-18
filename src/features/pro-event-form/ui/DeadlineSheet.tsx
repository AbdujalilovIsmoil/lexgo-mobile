import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { DEADLINE_KINDS, useDeadlineCalc, type DeadlineResult } from "@/entities/pro-calendar";
import { FormDate, FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { selectHaptic } from "@/shared/lib/haptics";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { gradient, radius, useColors } from "@/shared/theme";
import { Button, Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { FormSheet, SwitchField } from "@/shared/ui/admin";
import { daysTo } from "../lib/daysTo";
import { deadlineSchema } from "../model/eventSchema";

const nameOf = (label: string) => label.split(" — ")[0];
const EMPTY = { kind: "appeal", base: "", title: "", add: true } as const;
const ICON: Record<string, IconName> = { appeal: "repeat", document: "file-text", complaint: "alert-circle", general: "clock" };

// Procedural deadline calculator: pick the kind (four cards, each with its rule: 1 month · 10 days · 30 days · 7 days), the date it
// counts from and an optional name, choose whether it goes to the calendar, and get the final deadline as a big card with the days left.
export function DeadlineSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const f = useAppForm(deadlineSchema, EMPTY);
  const [res, setRes] = useState<DeadlineResult | null>(null);
  const calc = useDeadlineCalc();
  useSheetReset(visible, () => (f.reset(EMPTY), setRes(null)));
  const kind = f.watch("kind");
  const run = f.handleSubmit((v) => calc.mutate({ kind: v.kind, baseDate: v.base, add: v.add, title: v.title || t(`aw6.calc.kinds.${v.kind}`) }, { onSuccess: setRes }));
  const left = res ? daysTo(res.deadline) : 0;
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("aw6.calc.title")} subtitle={t("aw6.calc.lead")} onSubmit={res ? () => setRes(null) : () => void run()} submitLabel={res ? t("cal.again") : t("aw6.calc.run")} submitting={calc.isPending}>
      {res ? (
        <Animated.View entering={ZoomIn.duration(300)}>
          <LinearGradient colors={left < 0 ? ["#B42318", "#E5484D"] : [...gradient.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.result}>
            <View style={s.ring} pointerEvents="none" />
            <Text variant="caption" weight="bold" style={s.kick}>{t("cal.final").toUpperCase()}</Text>
            <Text variant="hx" tone="white">{fmtDate(res.deadline, locale)}</Text>
            <View style={s.pill}><Icon name="clock" size={14} tone="white" /><Text variant="small" weight="bold" tone="white">{left === 0 ? t("cal.todayWord") : left > 0 ? `${left} ${t("cal.left")}` : `${-left} ${t("cal.ago")}`}</Text></View>
            <View style={s.meta}>
              <Text variant="caption" style={s.soft}>{nameOf(t(`aw6.calc.kinds.${kind}`))} · {t(`cal.rule.${kind}`)}</Text>
              <Text variant="caption" style={s.soft}>{t("cal.base")}: {fmtDate(res.baseDate, locale)}</Text>
            </View>
            <View style={s.note}><Icon name={res.added ? "check-circle" : "info"} size={15} tone="white" /><Text variant="small" tone="white" style={s.flex}>{res.added ? t("cal.added") : t("aw6.calc.notAdded")}</Text></View>
          </LinearGradient>
        </Animated.View>
      ) : (
        <>
          <Text variant="small" tone="gray">{t("cal.kind")}</Text>
          <View style={s.grid}>
            {DEADLINE_KINDS.map((k) => {
              const on = kind === k;
              return (
                <PressableScale key={k} haptic={false} onPress={() => { selectHaptic(); f.setValue("kind", k); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.kind, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? c.accent : c.line }]}>
                  <View style={[s.ico, { backgroundColor: on ? c.accent : c.surface }]}><Icon name={ICON[k]} size={18} color={on ? "#FFFFFF" : c.accent} /></View>
                  <Text variant="small" weight="bold" numberOfLines={2}>{nameOf(t(`aw6.calc.kinds.${k}`))}</Text>
                  <View style={[s.rule, { backgroundColor: on ? c.accent : c.line }]}><Text variant="caption" weight="bold" style={{ color: on ? "#FFFFFF" : c.gray }}>{t(`cal.rule.${k}`)}</Text></View>
                </PressableScale>
              );
            })}
          </View>
          <FormDate control={f.control} name="base" label={t("aw6.calc.base")} />
          <FormInput control={f.control} name="title" label={t("aw6.calc.eventTitle")} />
          <SwitchField label={t("aw6.calc.add")} value={f.watch("add")} onChange={(v) => f.setValue("add", v)} />
        </>
      )}
      {res ? <Button title={t("adm.close")} variant="line" full onPress={onClose} /> : null}
    </FormSheet>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kind: { width: "48.5%", gap: 8, padding: 12, borderRadius: radius.r, borderWidth: 1.5 },
  ico: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rule: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 9 },
  result: { gap: 8, padding: 18, borderRadius: radius.rl, overflow: "hidden" },
  ring: { position: "absolute", width: 180, height: 180, borderRadius: 90, borderWidth: 22, borderColor: "rgba(255,255,255,0.08)", right: -50, top: -60 },
  kick: { color: "#93C6FF", letterSpacing: 1.2 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)" },
  meta: { gap: 2, marginTop: 4 },
  soft: { color: "rgba(255,255,255,0.85)" },
  note: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, padding: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.14)" },
  flex: { flex: 1 },
});
