import { View } from "react-native";
import { Text } from "@/shared/ui";
import { FactRows, FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { answerText, groupFields, type MyDoc } from "@/entities/my-document";
import { useAnswersForm } from "../model/useAnswersForm";
import { AnswerField } from "./AnswerField";
import { AnswersPreview } from "./AnswersPreview";

type Props = { doc: MyDoc; visible: boolean; editable: boolean; onClose: () => void };

// Field answers (PUT …/answers) in a sheet; read-only when the backend no longer lets the client edit.
export function AnswersSheet({ doc, visible, editable, onClose }: Props) {
  const { t } = useT();
  const f = useAnswersForm(doc, visible, onClose);
  const ready = f.missing.length === 0;
  return (
    <FormSheet
      visible={visible}
      onClose={onClose}
      title={t("dm4.title")}
      subtitle={t("dm4.progress", { n: f.filled, total: doc.fields.length })}
      onSubmit={editable ? () => (ready ? f.create.mutate() : f.save.mutate()) : undefined}
      submitLabel={ready ? t("dm4.saveCreate") : t("dm4.save")}
      submitting={ready ? f.create.isPending : f.save.isPending}
      secondary={editable && ready ? { label: t("dm4.save"), onPress: () => f.save.mutate() } : undefined}
      snaps={[0.82, 0.95]}
    >
      {editable ? <AnswersPreview preview={f.preview} /> : null}
      {groupFields(doc.fields).map((g) => (
        <View key={g.key || "all"} style={{ gap: 12 }}>
          {g.title ? <Text variant="h4">{g.title}</Text> : null}
          {editable
            ? g.fields.map((x) => <AnswerField key={x.name} f={x} value={f.values[x.name] ?? ""} onChange={(v) => f.set(x.name, v)} />)
            : <FactRows rows={g.fields.map((x) => ({ label: x.label, value: answerText(doc.answers, x.name) || "—" }))} />}
        </View>
      ))}
    </FormSheet>
  );
}
