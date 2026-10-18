import { StyleSheet, View } from "react-native";
import { Input, Text } from "@/shared/ui";
import { SwitchField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";
import { INCLUDED_PAGES, MAX_PAGES, type Options } from "../model/useOptions";

// Price inputs (web .docq): page count (counted from the text unless typed), OCR, urgent,
// advocate review and written opinion, with the range error and the extra-pages hint.
export function OptionsPanel({ o }: { o: Options }) {
  const { t } = useT();
  const mark = useInstructorTarget("doc-analysis:options", { label: t("cxDa.pages"), type: "section" });
  return (
    <View {...mark} style={s.col}>
      <Input label={t("cxDa.pages")} value={o.pagesInput || String(o.pageCount)} onChangeText={o.setPagesInput} keyboardType="number-pad" error={o.pagesOk ? undefined : t("cxDa.pagesRange", { max: MAX_PAGES })} />
      <SwitchField label={t("cxDa.ocr")} value={o.ocr} onChange={o.setOcr} />
      <SwitchField label={t("cxDa.urgent")} value={o.urgent} onChange={o.setUrgent} />
      <SwitchField label={t("cxDa.lawyerReview")} value={o.lawyerReview} onChange={o.setLawyerReview} />
      <SwitchField label={t("cxDa.writtenOpinion")} value={o.writtenOpinion} onChange={o.setWrittenOpinion} />
      {o.pagesOk && o.pageCount > INCLUDED_PAGES ? <Text variant="caption" tone="warn">{t("cxDa.extraPagesHint", { n: INCLUDED_PAGES })}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10 } });
