import { useState } from "react";
import { View } from "react-native";
import { Button, Pill, Text, toast } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { downloadVersionFile, exportVersions, StudioStatusPill, useStudioErrorText, useStudioText, type StudioDetail, type StudioVersion } from "@/entities/admin-studio";
import { fmtDateTime } from "@/shared/lib/format";

const ROLLBACK_OK = ["approved", "published"];
type Props = { detail: StudioDetail; canRollback: boolean; canExport: boolean; busy: boolean; onRollback: (v: StudioVersion) => void; onPreview: (v: StudioVersion) => void };

// Version history: preview each version, download its file, roll back to an approved or published one.
export function VersionsPane({ detail, canRollback, canExport, busy, onRollback, onPreview }: Props) {
  const { t, locale } = useStudioText();
  const errText = useStudioErrorText();
  const [loading, setLoading] = useState("");
  const guard = (key: string, fn: () => Promise<void>) => {
    setLoading(key);
    fn().catch((e) => toast(errText(e), "err")).finally(() => setLoading(""));
  };
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="small" tone="gray">{detail.versions.length ? t("admStudioB.versions.count", { n: detail.versions.length }) : t("admStudioB.versions.none")}</Text>
        {canExport && detail.versions.length ? <Button title={t("admStudioB.versions.excel")} icon="download" variant="line" size="sm" loading={loading === "xls"} onPress={() => guard("xls", () => exportVersions(detail.id, detail.title))} /> : null}
      </View>
      {detail.versions.map((v) => {
        const cur = !!v.id && v.id === detail.currentVersionId;
        const live = !!v.id && v.id === detail.publishedVersionId;
        return (
          <RowCard key={v.id || v.version} title={`v${v.version || "—"}`} subtitle={v.summary || t("admStudioB.versions.noSummary")} meta={[fmtDateTime(v.createdAt, locale), v.createdBy].filter(Boolean).join(" · ")} right={<StudioStatusPill status={v.status} raw={v.statusRaw} />}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {cur ? <Pill label={t("admStudioB.versions.current")} small /> : null}
              {live ? <Pill label={t("admStudioB.versions.live")} tone="ok" icon="upload-cloud" small /> : null}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Button title={t("admStudioB.versions.preview")} icon="eye" variant="soft" size="sm" onPress={() => onPreview(v)} />
              {v.hasFile && v.id ? <Button title={t("admStudioB.versions.file")} icon="paperclip" variant="line" size="sm" loading={loading === v.id} onPress={() => guard(v.id, () => downloadVersionFile(v.id, v.fileName))} /> : null}
              {canRollback && v.id && !cur && !live && ROLLBACK_OK.includes(v.status) ? <Button title={t("admStudioB.rollback.cta")} icon="rotate-ccw" variant="line" size="sm" disabled={busy} onPress={() => onRollback(v)} /> : null}
            </View>
          </RowCard>
        );
      })}
    </View>
  );
}
