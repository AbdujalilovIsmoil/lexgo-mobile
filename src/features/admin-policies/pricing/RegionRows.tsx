import { View } from "react-native";
import { normRegionKey, type Issue, type Pricing } from "@/entities/admin-policies";
import { Button, Icon, Input, PressableScale, Text } from "@/shared/ui";
import { NumField } from "../json/NumField";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { bad, Issues, under } from "./Issues";

// Region coefficients: the catalogue price is multiplied by the number; "default" covers every other region.
export function RegionRows({ p, issues, onChange }: { p: Pricing; issues: Issue[]; onChange: (p: Pricing) => void }) {
  const { t } = useT();
  const c = useColors();
  const set = (i: number, patch: Partial<Pricing["regions"][number]>) => onChange({ ...p, regions: p.regions.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const firstDefault = p.regions.findIndex((r) => normRegionKey(r.key) === "default");
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h4">{t("admPolC.pr.region.title")}</Text>
      <Text variant="caption" tone="gray">{t("admPolC.pr.region.hint")}</Text>
      {p.regions.map((r, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
          <View style={{ flex: 2 }}><Input label={t("admPolC.pr.regKey")} value={r.key} editable={i !== firstDefault} onChangeText={(v) => set(i, { key: v.toLowerCase() })} onBlur={() => set(i, { key: normRegionKey(r.key) })} autoCapitalize="none" autoCorrect={false} error={bad(issues, `regions.${i}.key`) ? " " : undefined} /></View>
          <View style={{ flex: 1 }}><NumField label="×" value={r.coef} error={bad(issues, `regions.${i}.coef`)} onChange={(v) => set(i, { coef: v })} /></View>
          <PressableScale disabled={i === firstDefault} onPress={() => onChange({ ...p, regions: p.regions.filter((_, j) => j !== i) })} hitSlop={8} style={{ paddingTop: 30, opacity: i === firstDefault ? 0.3 : 1 }}><Icon name="trash-2" size={18} color={c.err} /></PressableScale>
        </View>
      ))}
      <Button title={t("admPolC.pr.addRegion")} icon="plus" variant="soft" size="sm" onPress={() => onChange({ ...p, regions: [...p.regions, { key: "", coef: 1 }] })} />
      <Issues items={under(issues, "regions")} />
    </View>
  );
}
