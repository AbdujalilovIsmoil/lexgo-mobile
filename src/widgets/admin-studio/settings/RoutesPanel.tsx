import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { Button, Chip, Pill, Text } from "@/shared/ui";
import { PagedList, RowCard } from "@/shared/ui/admin";
import { byOrder, ctorMeta, ctorTint, useRoutes, useStudioAccess, useStudioText } from "@/entities/admin-studio";
import { fmtDate } from "@/shared/lib/format";
import { PanelHead } from "./PanelHead";
import { RouteSheet, type RouteTarget } from "./RouteSheet";

// Approval routes: who approves each constructor and in what order; constructors on the default order are listed too.
export function RoutesPanel({ bar }: { bar: ReactElement }) {
  const { t, role, ctorName, locale } = useStudioText();
  const query = useRoutes();
  const a = useStudioAccess();
  const [target, setTarget] = useState<RouteTarget | null>(null);
  const items = [...(query.data ?? [])].sort((x, y) => byOrder(x.code, y.code));
  const taken = items.map((r) => r.code);
  const ctors = a.constructors.map((c) => ({ value: c.code, label: `${c.code} · ${ctorName(c.code, c.title)}`, free: !c.approvalRequired })).sort((x, y) => byOrder(x.value, y.value));
  const uncovered = ctors.filter((c) => !c.free && !taken.includes(c.value));
  const chain = (steps: { role: string; title: string }[]) => steps.map((s, i) => `${i + 1}. ${s.title || role(s.role)}`).join("  ›  ");
  return (
    <>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(r) => r.id || r.code}
        renderItem={(r) => (
          <RowCard icon={ctorMeta(r.code).icon} tint={ctorTint(r.code)} title={r.title || ctorName(r.code)} subtitle={r.steps.length ? chain(r.steps) : t("admStudioC.routes.noSteps")} meta={`${r.code}${r.updatedAt ? ` · ${t("admStudioC.routes.updated", { d: fmtDate(r.updatedAt, locale) })}` : ""}`} right={<Pill label={t(`admStudioC.routes.status_${r.status === "active" ? "active" : "inactive"}`)} tone={r.status === "active" ? "ok" : "gray"} small />}>
            <Button title={t("adm.edit")} icon="edit-2" variant="soft" size="sm" onPress={() => setTarget({ route: r, code: r.code })} />
          </RowCard>
        )}
        empty={{ icon: "git-merge", title: t("admStudioC.routes.emptyTitle"), text: t("admStudioC.routes.emptyText") }}
        header={
          <View style={{ gap: 12, paddingBottom: 12 }}>
            {bar}
            <PanelHead title={t("admStudioC.routes.title")} text={t("admStudioC.routes.lead")}><Button title={t("admStudioC.routes.create")} icon="plus" variant="gradient" size="sm" onPress={() => setTarget({ route: null, code: "" })} /></PanelHead>
            <Text variant="caption" tone="gray">{t("admStudioC.routes.defaultLabel")}: 1. {role("studio_reviewer")}  ›  2. {role("studio_publisher")}</Text>
            {uncovered.length ? (
              <View style={{ gap: 6 }}>
                <Text variant="small" weight="bold">{t("admStudioC.routes.uncoveredTitle")}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{uncovered.slice(0, 24).map((c) => <Chip key={c.value} label={c.value} icon="plus" onPress={() => setTarget({ route: null, code: c.value })} />)}</View>
              </View>
            ) : null}
          </View>
        }
      />
      <RouteSheet target={target} codes={ctors.map((c) => ({ value: c.value, label: c.label }))} taken={taken} onClose={() => setTarget(null)} />
    </>
  );
}
