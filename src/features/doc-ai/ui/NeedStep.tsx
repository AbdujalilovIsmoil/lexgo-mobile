import { StyleSheet, View } from "react-native";
import { TemplateButton } from "@/entities/doc-form";
import { Card, Input, Text } from "@/shared/ui";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = {
  serviceId: string; title: string; need: string; extra: string; language: string;
  onNeed: (v: string) => void; onExtra: (v: string) => void; onLanguage: (v: string) => void;
};

// Step 1: say what the document is for. The AI asks its questions from this.
export function NeedStep({ serviceId, title, need, extra, language, onNeed, onExtra, onLanguage }: Props) {
  const { t } = useT();
  const langs = ["uz-latn", "uz-cyrl", "ru"].map((v) => ({ value: v, label: t(`dc5.lang.${v}`) }));
  return (
    <View style={s.col}>
      <Card tinted style={s.note}>
        <Text variant="h4">{t("dc5.howTitle")}</Text>
        <Text variant="small" tone="gray">{t("dc5.howText")}</Text>
        <TemplateButton serviceId={serviceId} name={title} label={t("dc5.viewBlank")} />
      </Card>
      <Input label={t("dc5.needLabel")} value={need} onChangeText={onNeed} placeholder={t("dc5.needPh")} multiline hint={t("dc5.needHint")} style={s.ta} />
      <SelectField label={t("dc5.langLabel")} value={language} options={langs} onChange={onLanguage} />
      <Input label={t("dc5.extraLabel")} value={extra} onChangeText={onExtra} placeholder={t("dc5.extraPh")} multiline style={s.ta2} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 14 },
  note: { gap: 8 },
  ta: { minHeight: 120, textAlignVertical: "top" },
  ta2: { minHeight: 72, textAlignVertical: "top" },
});
