import { StyleSheet, View } from "react-native";
import type { Classification } from "@/entities/intake";
import { Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export const word = (t: (k: string) => string, group: string, key: string) => {
  const v = key ? t(`cxIn.${group}.${key}`) : "";
  return v.startsWith("cxIn.") ? key : v;
};

// "Tahlil natijasi": urgency pill, category and executor rows, and the AI summary when it is not an echo of the input.
export function ResultHead({ result: r, urgent, text }: { result: Classification; urgent: boolean; text: string }) {
  const { t } = useT();
  const echo = text.trim().startsWith(r.summary.trim().slice(0, 200));
  const row = (label: string, value: string) => (
    <View style={s.kv}>
      <Text variant="small" tone="gray">{label}</Text>
      <Text variant="small" weight="bold" style={s.val}>{value || "—"}</Text>
    </View>
  );
  return (
    <View style={s.col}>
      <View style={s.head}>
        <Text variant="h4" style={s.val}>{t("cxIn.resultTitle")}</Text>
        <Pill label={word(t, "urgency", urgent ? "critical" : r.urgency)} tone={urgent ? "err" : "blue"} small />
      </View>
      {row(t("cxIn.category"), word(t, "categories", r.category))}
      {r.executorType ? row(t("cxIn.executor"), word(t, "executors", r.executorType)) : null}
      {r.summary && !echo ? <Text variant="small" tone="gray">{r.summary}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  kv: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  val: { flexShrink: 1 },
});
