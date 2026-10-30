import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAiTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { openUrl } from "@/shared/lib/links";
import type { Source } from "../model/types";
import { safeUrl } from "../lib/safeUrl";
import { SourcesSheet } from "./SourcesSheet";

const SHOWN = 3;

// Law references under an answer: a few chips, the rest (with snippets) in a drawer.
export function SourceChips({ sources }: { sources: Source[] }) {
  const aiTheme = useAiTheme();
  const { t } = useT();
  const [all, setAll] = useState(false);
  const rows = sources.filter((x) => x.title || x.url);
  if (!rows.length) return null;
  const more = rows.length - SHOWN;
  return (
    <View style={s.wrap}>
      <Text variant="caption" weight="semibold" style={{ color: aiTheme.muted }}>{t("ai.sources")}</Text>
      <View style={s.chips}>
        {rows.slice(0, SHOWN).map((x, i) => {
          const url = safeUrl(x.url);
          return (
            <PressableScale key={i} haptic={false} onPress={() => (url ? openUrl(url) : setAll(true))} style={s.chip}>
              <Icon name={url ? "external-link" : "book"} size={12} color={aiTheme.accent} />
              <Text variant="caption" numberOfLines={1} style={[s.label, { color: aiTheme.accent }]}>{x.title || x.url}</Text>
            </PressableScale>
          );
        })}
        {more > 0 ? (
          <PressableScale haptic={false} onPress={() => setAll(true)} style={s.chip}>
            <Text variant="caption" weight="semibold" style={{ color: aiTheme.accent }}>{t("ax1.moreSources", { n: more })}</Text>
          </PressableScale>
        ) : null}
      </View>
      <SourcesSheet visible={all} onClose={() => setAll(false)} sources={rows} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 6, marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, maxWidth: 240, backgroundColor: "rgba(95,217,255,0.12)" },
  label: { flexShrink: 1 },
});
