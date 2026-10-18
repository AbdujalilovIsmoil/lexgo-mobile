import { View } from "react-native";
import type { Issue, Pricing } from "@/entities/admin-policies";
import { Button, Icon, PressableScale, Text } from "@/shared/ui";
import { NumField } from "../json/NumField";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { bad, Issues, under } from "./Issues";

type Props = { p: Pricing; issues: Issue[]; onChange: (p: Pricing) => void };

// Experience premium: rows of "from – to years → +%", with add / remove and a sort when the order is wrong.
export function TierRows({ p, issues, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  const set = (i: number, k: "minYears" | "maxYears" | "percent", v: number) => onChange({ ...p, experience: p.experience.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
  const top = p.experience.reduce((m, x) => Math.max(m, Number.isFinite(x.maxYears) ? x.maxYears : -1), -1);
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h4">{t("admPolC.pr.exp.title")}</Text>
      <Text variant="caption" tone="gray">{t("admPolC.pr.exp.hint")}</Text>
      {p.experience.map((r, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}><NumField label={t("admPolC.pr.from")} value={r.minYears} error={bad(issues, `exp.${i}.minYears`)} onChange={(v) => set(i, "minYears", v)} /></View>
          <View style={{ flex: 1 }}><NumField label={t("admPolC.pr.to")} value={r.maxYears} error={bad(issues, `exp.${i}.maxYears`)} onChange={(v) => set(i, "maxYears", v)} /></View>
          <View style={{ flex: 1 }}><NumField label="%" value={r.percent} error={bad(issues, `exp.${i}.percent`)} onChange={(v) => set(i, "percent", v)} /></View>
          <PressableScale onPress={() => onChange({ ...p, experience: p.experience.filter((_, j) => j !== i) })} hitSlop={8} style={{ paddingTop: 30 }}><Icon name="trash-2" size={18} color={c.err} /></PressableScale>
        </View>
      ))}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title={t("admPol.addRow")} icon="plus" variant="soft" size="sm" onPress={() => onChange({ ...p, experience: [...p.experience, { minYears: top < 0 ? 0 : top < 99 ? top + 1 : NaN, maxYears: NaN, percent: NaN }] })} />
        {issues.some((i) => i.code === "order") ? <Button title={t("admPolC.pr.sort")} icon="arrow-up" variant="line" size="sm" onPress={() => onChange({ ...p, experience: [...p.experience].sort((a, b) => (a.minYears || 0) - (b.minYears || 0)) })} /> : null}
      </View>
      <Issues items={under(issues, "exp")} />
    </View>
  );
}
