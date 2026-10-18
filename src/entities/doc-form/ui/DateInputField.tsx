import { useState } from "react";
import { Input, IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { maskDoc } from "../lib/dateParts";
import { isoToDoc } from "../lib/values";
import type { DocField } from "../model/types";
import { CalendarSheet } from "./CalendarSheet";

type Props = { field: DocField; value: string; error?: string; label: string; onChange: (v: string) => void };

// DD.MM.YYYY typed with a mask, or picked in the calendar sheet.
export function DateInputField({ field: f, value, error, label, onChange }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Input
        label={label}
        value={isoToDoc(value)}
        error={error}
        hint={f.hint}
        onChangeText={(v) => onChange(maskDoc(v))}
        placeholder={t("dc3.datePh")}
        keyboardType="number-pad"
        maxLength={10}
        right={<IconButton icon="calendar" size={36} onPress={() => setOpen(true)} label={t("dc3.pickDate")} />}
      />
      <CalendarSheet visible={open} title={f.label} value={isoToDoc(value)} onClose={() => setOpen(false)} onPick={onChange} />
    </>
  );
}
