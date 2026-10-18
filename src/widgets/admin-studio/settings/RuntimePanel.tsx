import type { ReactElement } from "react";
import { View } from "react-native";
import { useRuntime, useStudioText } from "@/entities/admin-studio";
import { Pill } from "@/shared/ui";
import { PagedList, RowCard } from "@/shared/ui/admin";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { PanelHead } from "./PanelHead";

// What the platform runs right now (GET /admin/studio/runtime): every published studio object and where it applies.
export function RuntimePanel({ bar }: { bar: ReactElement }) {
  const { t, ctorName, locale } = useStudioText();
  const query = useRuntime();
  return (
    <PagedList
      data={query.data ?? []} query={query} keyExtractor={(r) => r.id || `${r.code}-${r.version}-${r.publishedAt}`} empty={{ icon: "cpu", title: t("ag9.run.empty"), text: t("ag9.run.emptyText") }}
      renderItem={(r) => <RowCard icon="cpu" tint="#06B6D4" title={r.title || ctorName(r.code)} subtitle={[r.code, humanizeSlug(r.target)].filter(Boolean).join(" · ")} meta={[r.version ? `v${r.version}` : "", fmtDate(r.publishedAt, locale)].filter(Boolean).join(" · ")} right={r.status ? <Pill label={humanizeSlug(r.status)} tone="ok" small /> : undefined} />}
      header={<View style={{ gap: 12, paddingBottom: 12 }}>{bar}<PanelHead title={t("ag9.run.title")} text={t("ag9.run.lead")} /></View>}
    />
  );
}
