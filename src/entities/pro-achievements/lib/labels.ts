import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { ACH_TYPES } from "../model/types";

type T = (key: string) => string;

// A type in plain words; a value the app does not know is shown as the backend wrote it.
// A calendar day ("2026-10-05") as text; noon keeps the day the same in every time zone.
export const dayText = (d: string, locale: string): string => (d ? fmtDate(d.length === 10 ? `${d}T12:00:00` : d, locale) : "");

export const typeLabel = (k: string, t: T): string => ((ACH_TYPES as readonly string[]).includes(k) ? t(`ach.type.${k}`) : k ? humanizeSlug(k) : "");
