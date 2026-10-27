import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { codeOf, completeReview, type DurationCalendar, type DurationUnit } from "@/entities/market-flow";
import { FormInput, useAppForm } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { Segmented, Text } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { useFlowMutation } from "../model/useFlowMutation";

const UNITS: DurationUnit[] = ["minute", "hour", "day"];
const CALENDARS: DurationCalendar[] = ["calendar", "business_days"];
const schema = z.object({ value: z.string().regex(/^\d{1,4}$/, "mf.rv.invalid").refine((v) => Number(v) >= 1, "mf.rv.invalid") });
const EMPTY = { value: "" };

type Props = { orderId: string; visible: boolean; onClose: () => void };

// TZ §7.3: the seller ends the review stage and sets the delivery time (value ≥ 1, minutes / hours / days, calendar or business days).
// The backend computes the deadline. A phase that already moved on (order_not_in_review) closes the sheet and re-reads the order; an
// invalid duration is marked on the field.
export function ReviewDurationSheet({ orderId, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(schema, EMPTY);
  const [unit, setUnit] = useState<DurationUnit>("day");
  const [calendar, setCalendar] = useState<DurationCalendar>("calendar");
  useSheetReset(visible, () => {
    f.reset(EMPTY);
    setUnit("day");
    setCalendar("calendar");
  });
  const send = useFlowMutation({
    mutationFn: (value: number) => completeReview(orderId, { value, unit, calendar }),
    success: "mf.rv.done",
    onSuccess: onClose,
    onError: (e) => {
      const code = codeOf(e);
      if (code === "delivery_duration_invalid") {
        f.setError("value", { message: "mf.err.delivery_duration_invalid" });
        return true;
      }
      if (code === "order_not_in_review") onClose();
      return false;
    },
  });
  return (
    <FormSheet
      visible={visible}
      onClose={send.isPending ? () => undefined : onClose}
      title={t("mf.rv.sheetTitle")}
      subtitle={t("mf.rv.sheetLead")}
      onSubmit={() => void f.handleSubmit((v) => send.mutate(Number(v.value)))()}
      submitLabel={t("mf.rv.confirm")}
      submitting={send.isPending}
      snaps={[0.7, 0.94]}
    >
      <FormInput control={f.control} name="value" label={t("mf.rv.value")} format={(v) => v.replace(/\D/g, "").slice(0, 4)} keyboardType="number-pad" maxLength={4} placeholder="5" />
      <View style={s.group}>
        <Text variant="caption" tone="gray">{t("mf.rv.unit")}</Text>
        <Segmented options={UNITS.map((u) => ({ value: u, label: t(`mf.rv.units.${u}`) }))} value={unit} onChange={setUnit} />
      </View>
      <View style={s.group}>
        <Text variant="caption" tone="gray">{t("mf.rv.calendar")}</Text>
        <Segmented options={CALENDARS.map((k) => ({ value: k, label: t(`mf.rv.calendars.${k}`) }))} value={calendar} onChange={setCalendar} />
      </View>
    </FormSheet>
  );
}

const s = StyleSheet.create({ group: { gap: 6 } });
