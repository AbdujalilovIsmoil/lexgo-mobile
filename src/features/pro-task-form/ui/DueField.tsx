import { StyleSheet, View } from "react-native";
import type { Control } from "react-hook-form";
import { FormDate } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { keyOf } from "@/shared/lib/pro/dates";
import { Chip } from "@/shared/ui";
import type { Draft } from "../model/draft";

const inDays = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return keyOf(d.getFullYear(), d.getMonth(), d.getDate());
};

type Props = { control: Control<Draft>; value: string; onPick: (day: string) => void };

// Due day: quick chips (today · tomorrow · in a week) and the calendar picker for any other day (clearable).
export function DueField({ control, value, onPick }: Props) {
  const { t } = useT();
  return (
    <View style={s.col}>
      <View style={s.chips}>
        {[["today", 0], ["tomorrow", 1], ["week", 7]].map(([k, n]) => <Chip key={k} label={t(`taskForm.${k}`)} active={value === inDays(Number(n))} onPress={() => onPick(inDays(Number(n)))} />)}
      </View>
      <FormDate control={control} name="due" clearable />
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
