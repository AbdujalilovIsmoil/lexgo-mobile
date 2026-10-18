import { View } from "react-native";
import { Text } from "@/shared/ui";
import { FormInput } from "@/shared/form";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { DocBasePicker } from "./DocBasePicker";
import { DocTypeField } from "./DocTypeField";
import { NEED_MAX, type useDocFlow } from "./useDocFlow";

// Fields of the document request: base, title, what the client needs, language and kind.
export function DocForm({ f }: { f: ReturnType<typeof useDocFlow> }) {
  const { t } = useT();
  const { v } = f;
  return (
    <View style={{ gap: 14 }}>
      <Text variant="small" tone="gray">{t("admSupC.doc.lead")}</Text>
      <DocBasePicker f={f} />
      <FormInput control={f.form.control} name="title" label={t("adm.title")} placeholder={t("admSupC.doc.titlePh")} maxLength={200} />
      <FormInput control={f.form.control} name="need" label={t("admSupC.doc.need")} placeholder={t("admSupC.doc.needPh")} multiline maxLength={NEED_MAX} hint={`${v.need.length}/${NEED_MAX}`} />
      <SelectField label={t("admSupC.doc.language")} value={v.language} options={["uz", "ru", "en"].map((l) => ({ value: l, label: t(`admSupC.lang.${l}`) }))} onChange={(language) => f.set({ language })} />
      <DocTypeField visible={f.visible} hasTemplate={Boolean(f.service?.templateId)} value={v.docType} onChange={(docType) => f.set({ docType })} />
      {f.err ? <Text variant="small" tone="err">{f.err}</Text> : null}
    </View>
  );
}
