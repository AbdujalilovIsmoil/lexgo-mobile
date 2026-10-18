import { useState } from "react";
import { View } from "react-native";
import { useDocs, useUploadDoc } from "@/entities/pro-onboarding";
import { Button, Skeleton, Text } from "@/shared/ui";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { DocRow } from "./DocRow";
import { useDocPick } from "./useDocPick";

const KINDS = ["license", "diploma", "qualification"] as const;

// Proof documents (licence, diploma …): what is already uploaded and a new upload (POST /seller-onboarding/documents).
export function DocumentsSheet({ visible, onClose, advocate }: { visible: boolean; onClose: () => void; advocate: boolean }) {
  const { t } = useT();
  const docs = useDocs();
  const pick = useDocPick();
  const [kind, setKind] = useState<string>(advocate ? "license" : "diploma");
  const up = useUploadDoc(pick.clear);
  useSheetReset(visible, pick.clear);
  const send = () => pick.doc && up.mutate({ file: { uri: pick.doc.uri, name: pick.doc.name }, kind });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("sl3.docs.title")} subtitle={t("sl3.docs.hint")} onSubmit={send} submitLabel={t("sl3.docs.upload")} submitting={up.isPending} disabled={!pick.doc}>
      {docs.isLoading ? <Skeleton height={64} round={16} /> : (docs.data ?? []).map((d) => <DocRow key={d.id} doc={d} />)}
      {!docs.isLoading && !docs.data?.length ? <Text variant="small" tone="gray">{t("sl3.docs.none")}</Text> : null}
      <SelectField label={t("sl3.docs.kindLabel")} value={kind} onChange={setKind} options={KINDS.map((k) => ({ value: k, label: t(`sl3.docs.kind.${k}`) }))} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button title={t("sl3.docs.pickFile")} icon="upload" variant="line" size="sm" onPress={() => void pick.fromFiles()} />
        <Button title={t("sl3.docs.pickCamera")} icon="camera" variant="line" size="sm" onPress={() => void pick.fromCamera()} />
      </View>
      {pick.doc ? <Text variant="small" weight="semibold" numberOfLines={2}>{pick.doc.name}</Text> : null}
    </FormSheet>
  );
}
