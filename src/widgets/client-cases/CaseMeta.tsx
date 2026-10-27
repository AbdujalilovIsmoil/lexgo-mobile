import { StyleSheet, View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useReplacement, type CaseItem } from "@/entities/client-case";
import { humanizeSlug } from "@/shared/lib/format";

// The case's next step and its latest replacement request. No answer deadline is made up here: the backend owns it (enterprise §5).
export function CaseMeta({ item }: { item: CaseItem }) {
  const { t } = useT();
  const repl = useReplacement(item.case?.id ?? "");
  const last = repl.data?.[repl.data.length - 1];
  const st = (last?.status ?? "").toLowerCase();
  const label = t(`ccs.replacementStates.${st}`) !== `ccs.replacementStates.${st}` ? t(`ccs.replacementStates.${st}`) : humanizeSlug(st);
  return (
    <View style={s.wrap}>
      {item.case?.nextAction ? <View style={s.row}><Icon name="arrow-right" size={13} tone="accent" /><Text variant="caption" tone="accent" style={s.flex}>{item.case.nextAction}</Text></View> : null}
      {last ? <Text variant="caption" tone="gray">{t("ccs.replacementStatus", { status: label })}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flex: 1 },
});
