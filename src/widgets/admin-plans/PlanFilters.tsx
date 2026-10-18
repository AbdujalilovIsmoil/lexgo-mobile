import { View } from "react-native";
import { PLAN_AUDIENCES, planAudience, type Plan, type PlanAudience } from "@/entities/admin-plans";
import { SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { PlanHero } from "./PlanHero";

export type AudienceFilter = "all" | PlanAudience;
type Props = { q: string; onQ: (v: string) => void; aud: AudienceFilter; onAud: (v: AudienceFilter) => void; hiddenView: boolean; onHiddenView: (v: boolean) => void; plans: Plan[]; inView: Plan[]; count?: number; note?: string };

// Hero, search, audience tiles (with counts) and a visible / hidden pair of tiles (only when something is hidden).
export function PlanFilters({ q, onQ, aud, onAud, hiddenView, onHiddenView, plans, inView, count, note }: Props) {
  const { t } = useT();
  const hidden = plans.filter((p) => p.hidden).length;
  const auds: AudienceFilter[] = ["all", ...PLAN_AUDIENCES.filter((a) => a !== "business" || plans.some((p) => planAudience(p).includes("business")))];
  const options = auds.map((a) => ({ value: a, label: t(a === "all" ? "adm.all" : `admPlans.audiences.${a}`), count: a === "all" ? inView.length : inView.filter((p) => planAudience(p).includes(a)).length }));
  const vis = [{ value: "visible", label: t("admPlansB.total"), count: plans.length - hidden }, { value: "hidden", label: t("admPlansB.hidden"), count: hidden }];
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <PlanHero plans={plans} />
      <View style={{ marginHorizontal: -16 }}><SearchBox value={q} onChangeText={onQ} placeholder={t("admPlans.searchPh")} /></View>
      <View style={{ marginHorizontal: -16, gap: 8 }}>
        <CcTiles options={options} value={aud} onChange={(v) => onAud(v as AudienceFilter)} />
        {hidden ? <CcTiles options={vis} value={hiddenView ? "hidden" : "visible"} onChange={(v) => onHiddenView(v === "hidden")} /> : null}
      </View>
      {count != null ? <Text variant="caption" tone="gray">{t("admPlans.shown", { n: count })}</Text> : null}
      {note ? <Text variant="caption" tone="warn">{note}</Text> : null}
    </View>
  );
}
