import { View } from "react-native";
import { FactRows, ProgressBar, SelectField } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { Assignment, AssignStrategy, Operator } from "@/entities/admin-leads";

type Props = { ops: Operator[]; plan: Assignment[]; strategy: AssignStrategy; onStrategy: (s: AssignStrategy) => void; progress: { done: number; total: number } | null };

// Strategy choice, the planned "+n per operator" list and the running progress.
export function AutoPreview({ ops, plan, strategy, onStrategy, progress }: Props) {
  const { t } = useT();
  const per = plan.reduce((m, a) => m.set(a.operator.id, (m.get(a.operator.id) ?? 0) + 1), new Map<string, number>());
  const rows = ops.filter((o) => per.has(o.id)).map((o) => ({ label: o.name || o.phone || o.lexgoId, value: `+${per.get(o.id)}` }));
  return (
    <View style={{ gap: 14 }}>
      <Text variant="small" tone="gray">{t("admLeadsC.autoText", { n: plan.length, m: ops.length })}</Text>
      <SelectField
        label={t("admLeadsC.autoStrategy")}
        value={strategy}
        options={[{ value: "round_robin" as const, label: t("admLeadsC.roundRobin") }, { value: "least_loaded" as const, label: t("admLeadsC.leastLoaded") }]}
        onChange={onStrategy}
      />
      <Text variant="small" tone="gray">{t("admLeadsC.autoPreview")}</Text>
      <FactRows rows={rows} />
      {progress ? (
        <View style={{ gap: 6 }}>
          <Text variant="caption" tone="gray">{t("admLeadsC.autoRunning", { done: progress.done, total: progress.total })}</Text>
          <ProgressBar value={progress.done / Math.max(1, progress.total)} />
        </View>
      ) : null}
    </View>
  );
}
