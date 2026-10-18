import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { wireValue } from "../lib/values";
import type { Problem } from "../model/useSectionWizard";
import type { DocAnswers, DocSection } from "../model/types";

type Props = { sections: DocSection[]; answers: DocAnswers; problems: Problem[]; onFix: (section: number) => void };

// What the client entered, per section, with the unanswered / invalid fields on top.
export function ReviewSummary({ sections, answers, problems, onFix }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.col}>
      {problems.length ? (
        <View style={[s.box, { backgroundColor: c.warnBg }]}>
          <Text variant="h4" style={{ color: c.warn }}>{t("dc2.missing", { n: problems.length })}</Text>
          {problems.map((p) => (
            <PressableScale key={p.field.key} onPress={() => onFix(p.section)} style={s.fix}>
              <Icon name="alert-circle" size={16} color={c.warn} />
              <Text variant="small" style={s.flex} numberOfLines={2}>{p.field.label}</Text>
              <Icon name="chevron-right" size={16} color={c.warn} />
            </PressableScale>
          ))}
        </View>
      ) : null}
      {sections.map((sec) => (
        <View key={sec.id} style={[s.box, { backgroundColor: c.surface, borderColor: c.line, borderWidth: 1 }]}>
          <Text variant="h4">{sec.title}</Text>
          {sec.fields.map((f) => {
            const v = wireValue(f, answers[f.key]);
            return (
              <View key={f.key} style={s.row}>
                <Text variant="caption" tone="gray">{f.label}</Text>
                <Text variant="small" weight="semibold" tone={v ? "ink" : "gray2"}>{v || t("dc2.empty")}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  box: { borderRadius: 16, padding: 14, gap: 8 },
  fix: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  flex: { flex: 1 },
  row: { gap: 2 },
});
