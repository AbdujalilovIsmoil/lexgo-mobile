import { View } from "react-native";
import type { DrillSection } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";
import { Text } from "@/shared/ui";
import { FactRows, LineChart } from "@/shared/ui/admin";
import { DrillBars } from "./DrillBars";
import { DrillList } from "./DrillList";

// One block of a drill sheet: bars, record list, key/value facts or a trend line.
export function DrillSectionView({ s }: { s: DrillSection }) {
  const { t } = useT();
  const empty = <Text variant="small" tone="gray">{("empty" in s && s.empty) || t("admDashB.drill.empty")}</Text>;
  let body = empty;
  if (s.kind === "kv") body = <FactRows rows={s.rows.map((r) => ({ label: r.label, value: r.value ? <Text variant="small" weight="semibold" tone={r.tone === "ok" ? "ok" : r.tone === "bad" ? "err" : "ink"}>{r.value}</Text> : undefined }))} />;
  else if (s.kind === "series") body = s.points.length ? <LineChart data={s.points.map((p) => ({ x: p.label, y: p.value }))} format={s.format} height={130} /> : empty;
  else if (s.rows.length) body = s.kind === "bars" ? <DrillBars rows={s.rows} /> : <DrillList rows={s.rows} />;
  return (
    <View style={{ gap: 8 }}>
      {s.title ? <Text variant="small" weight="bold" tone="gray">{s.title}</Text> : null}
      {body}
    </View>
  );
}
