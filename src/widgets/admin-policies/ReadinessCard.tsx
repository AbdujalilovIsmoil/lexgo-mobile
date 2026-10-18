import { ReadinessRow, readinessTone, useReadiness } from "@/entities/admin-policies";
import { QueryBoundary, SectionCard } from "@/shared/ui/admin";
import { Pill, Text } from "@/shared/ui";
import { View } from "react-native";
import { useT } from "@/shared/i18n";

// Production-readiness checklist from the backend: what is done and which external integrations are pending.
export function ReadinessCard() {
  const { t } = useT();
  const q = useReadiness();
  const r = q.data;
  const key = `admPolB.ready.${r?.status}`;
  return (
    <SectionCard title={t("admPol.readyTitle")}>
      <QueryBoundary query={q}>
        <View style={{ gap: 4 }}>
          {r?.status ? <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><Pill tone={readinessTone(r.status)} label={t(key) !== key ? t(key) : r.status} /><Text variant="caption" tone="gray">{r.passed} / {r.total}</Text></View> : null}
          <Text variant="caption" tone="gray">{t("admPol.readyLead")}</Text>
          {r?.items.map((i) => <ReadinessRow key={i.key} item={i} />)}
          {r && !r.items.length ? <Text variant="caption" tone="gray" selectable style={{ fontFamily: "Courier" }}>{JSON.stringify(r.raw, null, 2)}</Text> : null}
        </View>
      </QueryBoundary>
    </SectionCard>
  );
}
