import { View } from "react-native";
import { Card, Text } from "@/shared/ui";
import { StudioStatusPill, useStudioText, type StudioVersion } from "@/entities/admin-studio";
import { fmtDateTime } from "@/shared/lib/format";

// One version as a short card (shown inside the publish / roll back sheets).
export function VersionLine({ version }: { version: StudioVersion }) {
  const { t, locale } = useStudioText();
  return (
    <Card style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Text variant="body" weight="bold">v{version.version || "—"}</Text>
        <StudioStatusPill status={version.status} raw={version.statusRaw} />
      </View>
      <Text variant="caption" tone="gray">{[fmtDateTime(version.createdAt, locale), version.createdBy].filter(Boolean).join(" · ")}</Text>
      <Text variant="small">{version.summary || t("admStudioB.versions.noSummary")}</Text>
    </Card>
  );
}
