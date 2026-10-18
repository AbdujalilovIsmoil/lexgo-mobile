import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Chip, Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; title: string; value: string; onPick: (hm: string) => void };

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

// HH:MM chooser (15-minute steps): pick the hour, then the minutes.
export function TimeSheet({ visible, onClose, title, value, onPick }: Props) {
  const { t } = useT();
  const [h, setH] = useState("09");
  const [m, setM] = useState("00");
  useSheetReset(visible, () => {
    const [hh, mm] = value.split(":");
    setH(hh?.padStart(2, "0") ?? "09");
    setM(MINUTES.includes(mm) ? mm : "00");
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={title} subtitle={`${h}:${m}`} onSubmit={() => { onPick(`${h}:${m}`); onClose(); }} submitLabel={t("adm.apply")} snaps={[0.62]}>
      <Text variant="small" tone="gray">{t("sl8.hour")}</Text>
      <View style={s.grid}>{HOURS.map((x) => <Chip key={x} label={x} active={x === h} onPress={() => setH(x)} />)}</View>
      <Text variant="small" tone="gray">{t("sl8.minute")}</Text>
      <View style={s.grid}>{MINUTES.map((x) => <Chip key={x} label={x} active={x === m} onPress={() => setM(x)} />)}</View>
    </FormSheet>
  );
}

const s = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
