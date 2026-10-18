import { View } from "react-native";
import { useAiStatus } from "@/entities/admin-system";
import { FactRows, QueryBoundary, RowCard, SectionCard, StatusPill } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// The AI assistant: provider, model, configured flag, the page registry size and the tools it may call (with their risk).
export function AiStatusView() {
  const { t } = useT();
  const q = useAiStatus();
  const d = q.data;
  return (
    <QueryBoundary query={q}>
      {d ? (
        <View style={{ gap: 12 }}>
          <FactRows rows={[
            { label: t("adm.status"), value: <StatusPill status={d.status} /> }, { label: t("ag7.ai.provider"), value: d.provider }, { label: t("ag7.ai.model"), value: d.model },
            { label: t("ag7.ai.configured"), value: d.configured ? t("adm.yes") : t("adm.no") }, { label: t("ag7.ai.pages"), value: String(d.pages) }, { label: t("ag7.ai.perms"), value: String(d.permissions) },
          ]} />
          <SectionCard title={`${t("ag7.ai.tools")} · ${d.tools.length}`} padded={false}>
            <View style={{ padding: 12, gap: 8 }}>
              {d.tools.map((x) => <RowCard key={x.name} icon="tool" title={x.name} subtitle={x.description} right={<StatusPill status={x.risk.toLowerCase() === "low" ? "ok" : "pending"} label={x.risk} />} />)}
            </View>
          </SectionCard>
        </View>
      ) : null}
    </QueryBoundary>
  );
}
