import { View } from "react-native";
import { Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { PayloadView, StudioStatusPill, useStudioText, type StudioVersion } from "@/entities/admin-studio";
import { fmtDateTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";

// Read-only look at the data of one version.
export function PreviewSheet({ version, onClose }: { version: StudioVersion | null; onClose: () => void }) {
  const { t, locale } = useStudioText();
  const v = useKept(version);
  return (
    <FormSheet visible={!!version} onClose={onClose} title={t("admStudioB.preview.title", { v: v?.version || "—" })} snaps={[0.7, 0.94]}>
      {v ? (
        <>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <StudioStatusPill status={v.status} raw={v.statusRaw} />
            <Text variant="caption" tone="gray">{[fmtDateTime(v.createdAt, locale), v.createdBy].filter(Boolean).join(" · ")}</Text>
          </View>
          {v.summary ? <Text variant="small">{v.summary}</Text> : null}
          {Object.keys(v.payload).length ? <PayloadView value={v.payload} /> : <Text variant="small" tone="gray">{t("admStudioB.preview.empty")}</Text>}
        </>
      ) : null}
    </FormSheet>
  );
}
