import { View } from "react-native";
import { percentSum, type PkgDraft, type PkgMilestone } from "@/entities/admin-packages";
import { Button, Card, IconButton, Input, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { draft: PkgDraft; onChange: (m: PkgMilestone[]) => void };

// Payment milestones: title, share of the price and the acceptance criterion; the shares must add up to 100 %.
export function MilestonesSection({ draft, onChange }: Props) {
  const { t } = useT();
  const sum = percentSum(draft);
  const set = (i: number, m: PkgMilestone) => onChange(draft.milestones.map((x, j) => (j === i ? m : x)));
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h4">{t("ag5.milestones")} <Text variant="small" tone={sum === 100 ? "ok" : "err"}>{sum}%</Text></Text>
      {draft.milestones.map((m, i) => (
        <Card key={i} style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-end" }}>
            <View style={{ flex: 1 }}><Input label={t("adm.title")} value={m.title} onChangeText={(title) => set(i, { ...m, title })} /></View>
            <View style={{ width: 84 }}><Input label="%" value={m.percent ? String(m.percent) : ""} onChangeText={(x) => set(i, { ...m, percent: Math.min(100, Number(x.replace(/\D/g, "")) || 0) })} keyboardType="number-pad" /></View>
            {draft.milestones.length > 1 ? <IconButton icon="x" size={40} onPress={() => onChange(draft.milestones.filter((_, j) => j !== i))} label={t("adm.delete")} /> : null}
          </View>
          <Input label={t("ag5.criteria")} value={m.criteria} onChangeText={(criteria) => set(i, { ...m, criteria })} />
        </Card>
      ))}
      <Button title={t("ag5.addMilestone")} icon="plus" variant="soft" onPress={() => onChange([...draft.milestones, { index: draft.milestones.length + 1, title: "", percent: 0, criteria: "" }])} />
    </View>
  );
}
