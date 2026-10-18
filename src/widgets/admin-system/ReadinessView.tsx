import { View } from "react-native";
import { useReadiness } from "@/entities/admin-system";
import { KpiGrid, KpiTile, QueryBoundary, RowCard, SectionCard, StatusPill } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// End-to-end readiness (GET /admin/e2e/readiness): the data the flows need, and every scenario with its checks.
export function ReadinessView() {
  const { t, locale } = useT();
  const q = useReadiness();
  const d = q.data;
  return (
    <QueryBoundary query={q}>
      {d ? (
        <View style={{ gap: 12 }}>
          <RowCard icon="check-circle" tint="#22C55E" title={t("ag7.ready.title")} subtitle={fmtDateTime(d.checkedAt, locale)} right={<StatusPill status={d.status} />} />
          <KpiGrid>{d.fixtures.map((f) => <KpiTile key={f.key} label={humanizeSlug(f.key)} value={String(f.value)} />)}</KpiGrid>
          {d.scenarios.map((s) => (
            <SectionCard key={s.key} title={humanizeSlug(s.key)} action={undefined}>
              <StatusPill status={s.status} />
              {s.checks.map((c) => <Text key={c.key} variant="small" tone={c.ok ? "ink" : "err"}>{humanizeSlug(c.key)}: {c.value}</Text>)}
              {s.routes.length ? <Text variant="caption" tone="gray2">{s.routes.join(" · ")}</Text> : null}
            </SectionCard>
          ))}
        </View>
      ) : null}
    </QueryBoundary>
  );
}
