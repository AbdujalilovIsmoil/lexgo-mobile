import { humanizeSlug } from "@/shared/lib/format";
import { EXP_CHECKS, EXP_RESULTS, EXP_STAGES } from "../model/types";

type T = (key: string, params?: Record<string, string | number>) => string;
const has = (list: readonly string[], k: string) => list.includes(k);

// A stage, result or checklist item in the user's language; a value the app does not know is shown as the backend wrote it.
export const stageLabel = (k: string, t: T) => (has(EXP_STAGES, k) ? t(`mf.exp.stage.${k}`) : humanizeSlug(k));
export const resultLabel = (k: string, t: T) => (has(EXP_RESULTS, k) ? t(`mf.exp.result.${k}`) : humanizeSlug(k));
export const checkLabel = (k: string, t: T) => (has(EXP_CHECKS, k) ? t(`pxp.check.${k}`) : humanizeSlug(k));
