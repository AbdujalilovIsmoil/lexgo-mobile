import { useState } from "react";
import { View } from "react-native";
import { useReglamentDetail, useRegLabels, type Reglament } from "@/entities/admin-aireg";
import { ChipBar, FactRows, FormSheet } from "@/shared/ui/admin";
import { Pill, Skeleton, Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// One reglament in full: facts, the text of any version (chips switch versions) and the version history.
export function ReglamentDetailSheet({ item, canEdit, onEdit, onClose }: { item: Reglament | null; canEdit: boolean; onEdit: (r: Reglament) => void; onClose: () => void }) {
  const { t, locale } = useT();
  const l = useRegLabels();
  const kept = useKept(item);
  const detail = useReglamentDetail(kept);
  const [pick, setPick] = useState("");
  const r = detail.data ?? kept;
  const current = r ? { key: "cur", id: "", version: r.version, status: r.status, content: r.content, createdAt: r.updatedAt, author: r.author, source: r.source, fileName: r.fileName, note: "" } : null;
  const history = r ? (r.versions.length ? r.versions : current && (r.version || r.content) ? [current] : []) : [];
  const viewing = pick && history.some((v) => v.version === pick) ? pick : r?.version;
  const viewed = history.find((v) => v.version === viewing);
  const shown = r && viewing === r.version ? r.content || viewed?.content || "" : viewed?.content || "";
  const fromFile = !!r && (!!r.fileName || r.source === "upload" || r.source === "file");
  return (
    <FormSheet visible={!!item} onClose={onClose} title={r?.title ?? ""} subtitle={r ? `${l.cat(r.category)} · v${r.version}` : undefined} onSubmit={canEdit && r?.id ? () => onEdit(r) : undefined} submitLabel={t("admAiReg.newVersion")} snaps={[0.8, 0.96]}>
      {r ? (
        <>
          <View style={{ flexDirection: "row", gap: 8 }}><Pill tone={r.status === "active" ? "ok" : r.status === "draft" ? "warn" : "gray"} label={l.status(r.status, r.statusRaw)} /></View>
          <FactRows rows={[
            { label: t("adm.updated"), value: fmtDateTime(r.updatedAt, locale) },
            { label: t("adm.created"), value: fmtDateTime(r.createdAt, locale) },
            { label: t("admAiReg.source"), value: fromFile ? r.fileName || t("admAiReg.sourceFile") : t("admAiReg.sourceEditor") },
            { label: t("admAiReg.author"), value: r.author },
          ]} />
          {history.length > 1 ? <View style={{ marginHorizontal: -18 }}><ChipBar options={history.map((v) => ({ value: v.version, label: `v${v.version}` }))} value={viewing ?? ""} onChange={setPick} /></View> : null}
          <Text variant="h4">{viewing && viewing !== r.version ? t("admAiReg.textOf", { v: viewing }) : t("admAiReg.text")}</Text>
          {shown ? <Text variant="small" selectable>{shown}</Text> : detail.isLoading ? <Skeleton height={80} round={16} /> : <Text variant="small" tone="gray">{t("admAiReg.noText")}</Text>}
          {viewed?.note ? <Text variant="caption" tone="gray">{viewed.note}</Text> : null}
        </>
      ) : null}
    </FormSheet>
  );
}
