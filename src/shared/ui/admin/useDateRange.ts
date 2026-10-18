import { useMemo, useState } from "react";
import { daysAgo, isoDay } from "@/shared/lib/format";

export type DatePreset = "today" | "d7" | "d30" | "d90" | "all" | "custom";
const DAYS: Record<string, number> = { d7: 7, d30: 30, d90: 90 };

// State of a period filter. `range` is what the API takes as date_from / date_to
// (empty strings = unbounded).
export function useDateRange(initial: DatePreset = "d30") {
  const [preset, setPreset] = useState<DatePreset>(initial);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const range = useMemo(() => {
    if (preset === "all") return { from: "", to: "" };
    if (preset === "custom") return { from, to };
    if (preset === "today") return { from: isoDay(), to: isoDay() };
    return { from: daysAgo(DAYS[preset]), to: isoDay() };
  }, [preset, from, to]);
  return { preset, setPreset, from, to, setFrom, setTo, range };
}
export type DateRange = ReturnType<typeof useDateRange>;
