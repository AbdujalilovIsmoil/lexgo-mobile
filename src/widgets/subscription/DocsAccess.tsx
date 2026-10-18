import { View } from "react-native";
import type { Entitlements } from "@/entities/plan";
import { SectionCard } from "@/shared/ui/admin";
import { Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// What the plan unlocks for documents (manual_documents of the entitlements answer).
export function DocsAccess({ docs, aiLimit }: { docs: Entitlements["docs"]; aiLimit: string }) {
  const c = useColors();
  const { t } = useT();
  const rows = [
    { on: docs.templates, label: t("py4.docs.templates") },
    { on: docs.download, label: t("py4.docs.download") },
    { on: docs.fill, label: t("py4.docs.fill") },
  ];
  return (
    <SectionCard title={t("py4.docs.title")}>
      {rows.map((r) => (
        <View key={r.label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Icon name={r.on ? "check-circle" : "x-circle"} size={18} color={r.on ? c.ok : c.gray2} />
          <Text variant="small" tone={r.on ? "ink" : "gray2"}>{r.label}</Text>
        </View>
      ))}
      {aiLimit ? <Text variant="small" tone="gray">{t("py4.ai", { v: aiLimit === "unlimited" ? t("py3.unlimited") : aiLimit })}</Text> : null}
      {docs.source ? <Text variant="caption" tone="gray2">{t("py4.source", { s: docs.source })}</Text> : null}
    </SectionCard>
  );
}
