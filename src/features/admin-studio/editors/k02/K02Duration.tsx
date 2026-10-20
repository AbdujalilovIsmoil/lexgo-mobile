import { View } from "react-native";
import { Segmented, Text } from "@/shared/ui";
import { Field, SelectField } from "@/shared/ui/admin";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../../form/Block";
import { NumberField } from "../../form/NumberField";
import type { Errors } from "../../form/types";
import { errorFor, str, withKey } from "../../form/values";

const UNITS = ["minute", "hour", "day"];
type Props = { payload: Dict; onChange: (p: Dict) => void; errors: Errors; readOnly: boolean };

// Value, unit and how the days are counted. Business days say "Monday–Friday" out loud, and the note repeats when the clock starts.
export function K02Duration({ payload, onChange, errors, readOnly }: Props) {
  const { t } = useT();
  const set = (k: string, v: unknown) => onChange(withKey(payload, k, v));
  const cal = str(payload.duration_calendar) || "calendar";
  return (
    <Block title={t("admStudioD.k02.duration")} hint={t("admStudioD.k02.durationHint")}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><NumberField label={t("admStudioD.k02.value")} value={payload.duration_value} onChange={(v) => set("duration_value", v)} readOnly={readOnly} error={errorFor(errors, "duration_value")} /></View>
        <View style={{ flex: 1 }}><SelectField label={t("admStudioD.k02.unit")} value={str(payload.duration_unit)} options={UNITS.map((u) => ({ value: u, label: t(`admStudioD.k02.units.${u}`) }))} onChange={(v) => !readOnly && set("duration_unit", v)} error={errorFor(errors, "duration_unit")} /></View>
      </View>
      <Field label={t("admStudioD.k02.calendar")} error={errorFor(errors, "duration_calendar")}>
        <Segmented options={["calendar", "business_days"].map((v) => ({ value: v, label: t(`admStudioD.k02.calendars.${v}`) }))} value={cal} onChange={(v) => !readOnly && set("duration_calendar", v)} />
      </Field>
      {cal === "business_days" ? <Text variant="caption" tone="gray">{t("admStudioD.k02.businessNote")}</Text> : null}
    </Block>
  );
}
