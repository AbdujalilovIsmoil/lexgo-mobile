import { useState } from "react";
import { View } from "react-native";
import { useBusinessHours, useRemoveHoliday } from "@/entities/admin-policies";
import { HolidaySheet, SimulateSheet } from "@/features/admin-policies";
import { QueryBoundary, SectionCard } from "@/shared/ui/admin";
import { Button, Chip, Pill, Text, confirmDialog } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useAccess } from "@/entities/access";
import { useT } from "@/shared/i18n";

// Working-hours calendar: the weekly schedule, public holidays (add / remove) and a time simulator.
export function CalendarCard() {
  const { t, locale } = useT();
  const q = useBusinessHours();
  const remove = useRemoveHoliday();
  const canEdit = useAccess().can("cases.manage");
  const [adding, setAdding] = useState(false);
  const [sim, setSim] = useState(false);
  const h = q.data;
  const ask = (day: string) =>
    confirmDialog({ title: t("adm.confirmDeleteTitle"), message: fmtDate(day, locale), confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: async () => { await remove.mutateAsync(day); } });
  return (
    <SectionCard title={t("admPol.cal.title")}>
      <Text variant="small" tone="gray">{t("admPol.cal.lead")}</Text>
      <QueryBoundary query={q}>
        {h ? (
          <View style={{ gap: 10 }}>
            <Text variant="body" weight="bold">{h.days.map((d) => t(`admPolB.wd.${d}`)).join(", ")} · {h.start}–{h.end}</Text>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Text variant="caption" tone="gray">{h.timezone}</Text>
              {h.isWorkingTime !== null ? <Pill small tone={h.isWorkingTime ? "ok" : "gray"} label={h.isWorkingTime ? t("admPol.cal.open") : t("admPol.cal.closed")} /> : null}
            </View>
            <Text variant="small" weight="semibold">{t("admPol.cal.holidays")} ({h.holidays.length})</Text>
            {h.holidays.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{h.holidays.map((d) => <Chip key={d} label={fmtDate(d, locale)} icon={canEdit ? "x" : undefined} onPress={canEdit ? () => ask(d) : undefined} />)}</View> : <Text variant="caption" tone="gray">{t("admPol.cal.none")}</Text>}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {canEdit ? <Button title={t("admPol.addHoliday")} icon="plus" variant="soft" size="sm" onPress={() => setAdding(true)} /> : null}
              <Button title={t("admPol.simTitle")} icon="clock" variant="line" size="sm" onPress={() => setSim(true)} />
            </View>
          </View>
        ) : null}
      </QueryBoundary>
      <HolidaySheet visible={adding} onClose={() => setAdding(false)} />
      <SimulateSheet visible={sim} onClose={() => setSim(false)} />
    </SectionCard>
  );
}
