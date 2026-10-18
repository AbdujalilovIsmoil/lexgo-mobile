import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Controller } from "react-hook-form";
import { BusinessHoursBadge } from "@/entities/business-hours";
import { MIN_PROBLEM_CHARS } from "@/entities/intake";
import { useFieldError } from "@/shared/form";
import { AiOrb, Button, Icon, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";
import type { useIntake } from "../model/useIntake";

// The problem composer: one rounded sheet with the AI orb and the label on top, a borderless writing area, and a
// footer with the live character count (a tick once it is long enough) and the "Tahlil qilish" pill. The outline lights
// up while writing. Under it, the AI-hand-off hint and the operator-hours chip. Validation: intakeSchema (8+ characters).
export function IntakeForm({ intake: i }: { intake: ReturnType<typeof useIntake> }) {
  const { t } = useT();
  const c = useColors();
  const tr = useFieldError();
  const [focus, setFocus] = useState(false);
  const field = useInstructorTarget("intake:input", { label: t("cxIn.label"), type: "input" });
  const btn = useInstructorTarget("button:intake-analyze", { label: t("cxIn.analyze"), type: "button" });
  const ready = i.text.trim().length >= MIN_PROBLEM_CHARS;
  return (
    <View style={s.col}>
      <Controller control={i.control} name="text" render={({ field: f, fieldState }) => (
        <View {...field} style={[s.sheet, { backgroundColor: c.surface, borderColor: fieldState.error ? c.err : focus ? c.accent : c.line }]}>
          <View style={s.top}>
            <AiOrb size={34} />
            <Text variant="h4" style={s.flex}>{t("cxIn.label")}</Text>
          </View>
          <TextInput value={String(f.value ?? "")} onChangeText={f.onChange} onFocus={() => setFocus(true)} onBlur={() => { setFocus(false); f.onBlur(); }} multiline maxLength={4000} editable={!i.busy} placeholder={t("cxIn.placeholder")} placeholderTextColor={c.gray2} accessibilityLabel={t("cxIn.label")} style={[s.input, { color: c.ink }]} />
          {fieldState.error ? <Text variant="caption" tone="err">{tr(fieldState.error.message)}</Text> : null}
          <View style={[s.foot, { borderTopColor: c.line }]}>
            <View style={s.count}>
              {ready ? <Icon name="check-circle" size={15} color={c.ok} /> : null}
              <Text variant="caption" tone={ready ? "ink" : "gray2"}>{i.text.length}/4000</Text>
            </View>
            <View {...btn}><Button title={i.busy ? t("cxIn.analyzing") : t("cxIn.analyze")} icon="zap" variant="gradient" size="sm" loading={i.busy} onPress={() => void i.analyze()} /></View>
          </View>
        </View>
      )} />
      <Text variant="caption" tone="gray">{t("cxIn.hint")}</Text>
      <BusinessHoursBadge note={t("cxIn.operatorHours")} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  sheet: { borderRadius: radius.rx, borderWidth: 1.5, padding: 16, gap: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: { minHeight: 132, fontSize: 16, lineHeight: 23, textAlignVertical: "top", paddingTop: 4 },
  foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1 },
  count: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flex: 1 },
});
