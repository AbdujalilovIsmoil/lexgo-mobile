import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDocs, useUploadDoc } from "@/entities/pro-onboarding";
import { radius, useColors } from "@/shared/theme";
import { Button, Icon, IconButton, Skeleton, Text } from "@/shared/ui";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { DocRow } from "./DocRow";
import { useDocPick } from "./useDocPick";

const KINDS = ["license", "diploma", "qualification"] as const;

// Proof documents (licence, diploma …): what is already uploaded and a new upload (POST /seller-onboarding/documents).
export function DocumentsSheet({ visible, onClose, advocate }: { visible: boolean; onClose: () => void; advocate: boolean }) {
  const { t } = useT();
  const c = useColors();
  const docs = useDocs();
  const pick = useDocPick();
  const [kind, setKind] = useState<string>(advocate ? "license" : "diploma");
  const up = useUploadDoc(pick.clear);
  useSheetReset(visible, pick.clear);
  const send = () => pick.doc && up.mutate({ file: { uri: pick.doc.uri, name: pick.doc.name }, kind });
  const replace = (k: string) => {
    if ((KINDS as readonly string[]).includes(k)) setKind(k);
    void pick.fromFiles();
  };
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("sl3.docs.title")} subtitle={t("sl3.docs.hint")} onSubmit={send} submitLabel={t("sl3.docs.upload")} submitting={up.isPending} disabled={!pick.doc}>
      {docs.isLoading ? (
        <View style={s.gap}><Skeleton height={64} round={14} /><Skeleton height={64} round={14} /></View>
      ) : (
        <View style={s.gap}>{(docs.data ?? []).map((d) => <DocRow key={d.id} doc={d} onReplace={() => replace(d.kind)} />)}</View>
      )}
      {!docs.isLoading && docs.isError ? (
        <Button title={t("common.retry")} icon="refresh-cw" variant="soft" size="sm" onPress={() => void docs.refetch()} style={s.btn} />
      ) : null}
      {!docs.isLoading && !docs.isError && !docs.data?.length ? (
        <View style={[s.empty, { backgroundColor: c.surface2 }]}>
          <Icon name="file-text" size={20} tone="gray" />
          <Text variant="small" tone="gray" style={s.flex}>{t("sl3.docs.none")}</Text>
        </View>
      ) : null}
      <Text variant="h4">{t("onbUx.docsNew")}</Text>
      <SelectField label={t("sl3.docs.kindLabel")} value={kind} onChange={setKind} options={KINDS.map((k) => ({ value: k, label: t(`sl3.docs.kind.${k}`) }))} />
      <View style={s.pickRow}>
        <Button title={t("sl3.docs.pickFile")} icon="upload" variant="line" size="sm" onPress={() => void pick.fromFiles()} style={s.btn} />
        <Button title={t("sl3.docs.pickCamera")} icon="camera" variant="line" size="sm" onPress={() => void pick.fromCamera()} style={s.btn} />
      </View>
      {pick.doc ? (
        <View style={[s.picked, { backgroundColor: c.tint2 }]} accessibilityLabel={`${t("onbUx.docsAttached")}: ${pick.doc.name}`}>
          <Icon name="paperclip" size={18} color={c.accent} />
          <Text variant="small" weight="semibold" numberOfLines={2} style={s.flex}>{pick.doc.name}</Text>
          <IconButton icon="x" onPress={pick.clear} label={t("onbUx.docsRemove")} />
        </View>
      ) : null}
    </FormSheet>
  );
}

const s = StyleSheet.create({
  gap: { gap: 10 },
  flex: { flex: 1 },
  pickRow: { flexDirection: "row", gap: 10 },
  btn: { minHeight: 44, justifyContent: "center" },
  empty: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: radius.r },
  picked: { flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 12, paddingVertical: 4, borderRadius: radius.r },
});
