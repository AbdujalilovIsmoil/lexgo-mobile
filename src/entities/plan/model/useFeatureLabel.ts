import { useCallback, useMemo } from "react";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { featureKeysOf } from "../lib/terms";
import type { FeatureTerm } from "./features";
import type { PlanGate } from "../lib/planGate";
import { usePlans } from "./queries";

type Translate = (key: string, params?: Record<string, string | number>) => string;

// The app's own name of a feature ("" when it has none) — usable outside React, where the catalogue's titles are not at hand.
export function ownFeatureName(t: Translate, key: string): string {
  for (const k of featureKeysOf(key)) for (const id of [`subq.feature.${k}`, `mf.plan.feature.${k}`]) if (t(id) !== id) return t(id);
  return "";
}

// The name of a plan feature: the tariff's own title from the catalogue (localized by the backend), else the app's text, else the title of
// the same feature under its older key, else the key itself made readable.
export function useFeatureLabel(): (key: string) => string {
  const { t } = useT();
  const plans = usePlans().data;
  const titles = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of plans ?? []) for (const f of p.functions) if (f.title && f.title !== f.key && !m.has(f.key)) m.set(f.key, f.title);
    return m;
  }, [plans]);
  return useCallback((key: string) => titles.get(key) || ownFeatureName(t, key) || featureKeysOf(key).map((k) => titles.get(k)).find(Boolean) || key.replace(/[_.]+/g, " "), [t, titles]);
}

// A limit in the feature's own unit ("5 ta hujjat"), "Cheksiz" or "Mavjud emas".
export function useTermValue(): (term: Pick<FeatureTerm, "mode" | "limit" | "unit">) => string {
  const { t } = useT();
  return useCallback((x) => {
    if (x.mode === "unavailable") return t("mf.plan.unavailable");
    if (x.mode === "unlimited" || x.limit === null) return t(x.mode === "unlimited" ? "mf.plan.unlimited" : "mf.plan.limited");
    const k = `subq.unit.${x.unit}`;
    return t(t(k) === k ? "subq.unit.any" : k, { n: x.limit });
  }, [t]);
}

const NAMES_FEATURE = new Set(["feature_limit_exhausted", "active_subscription_required", "feature_not_in_plan"]);

// The words of a gate: a short title per code and the reason, naming the feature when the backend said which one. An older or unknown
// 402 keeps the server's own sentence.
export function gateWords(t: Translate, g: PlanGate, feature: string): { title: string; text: string } {
  const text = g.code === "plan_required" && g.message ? g.message : feature && NAMES_FEATURE.has(g.code) ? t(`subq.gate.text.${g.code}`, { feature }) : t(`subq.gate.any.${g.code}`);
  return { title: t(`subq.gate.title.${g.code}`), text };
}

// The numbers of a used-up limit as the backend sent them: "5 / 5 ishlatildi · Yangilanadi: 24.11.2026" ("" when it sent none).
export function gateFacts(t: Translate, g: PlanGate, locale: string): string {
  const counted = g.limit !== null && g.limit > 0 && g.used !== null;
  return [counted ? t("mf.plan.used", { used: g.used ?? 0, limit: g.limit ?? 0 }) : "", g.resetsAt ? t("mf.plan.resets", { date: fmtDate(g.resetsAt, locale) }) : ""].filter(Boolean).join(" · ");
}

export function useGateText(g: PlanGate): { title: string; text: string } {
  const { t } = useT();
  const label = useFeatureLabel();
  return gateWords(t, g, g.featureKey ? label(g.featureKey) : "");
}
