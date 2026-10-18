import { StyleSheet, View } from "react-native";
import type { LegalSource } from "@/entities/intake";
import { openUrl } from "@/shared/lib/links";
import { useColors } from "@/shared/theme";
import { Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Official legal sources: a title, the "Rasmiy" badge and, with a link, an external-open arrow.
export function SourceList({ sources, title, lead }: { sources: LegalSource[]; title: string; lead?: string }) {
  const c = useColors();
  const { t } = useT();
  if (!sources.length) return null;
  return (
    <View style={s.col}>
      <Text variant="h4">{title}</Text>
      {lead ? <Text variant="caption" tone="gray">{lead}</Text> : null}
      {sources.map((x) => (
        <PressableScale key={x.key || x.url || x.title} disabled={!x.url} onPress={() => openUrl(x.url)} style={[s.row, { borderColor: c.line, backgroundColor: c.surface }]}>
          <Text variant="small" style={s.flex}>{x.title}</Text>
          {x.trustLevel === "official" ? <Pill label={t("cxIn.official")} tone="ok" small /> : null}
          {x.url ? <Icon name="external-link" size={15} color={c.accent} /> : null}
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, padding: 11, borderRadius: 14, borderWidth: 1.5 },
  flex: { flex: 1 },
});
