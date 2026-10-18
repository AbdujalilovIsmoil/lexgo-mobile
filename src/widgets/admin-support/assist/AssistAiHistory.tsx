import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { serverIso, type AiHistory } from "@/entities/admin-support";
import { Card, Icon, PressableScale, Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const PREVIEW = 3;

// The client's earlier chat with the AI instructor (collapsed; last 3 questions, "earlier" shows the rest).
export function AssistAiHistory({ history }: { history: AiHistory }) {
  const { t, locale } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(false);
  const turns = history.turns;
  if (!turns.length) return null;
  const shown = all ? turns : turns.slice(-PREVIEW);
  return (
    <Card style={s.card}>
      <PressableScale onPress={() => setOpen((v) => !v)} style={s.head}>
        <Icon name="cpu" size={20} tone="accent" />
        <View style={s.col}>
          <Text variant="body" weight="bold">{t("admSupB.ai.title")}</Text>
          <Text variant="caption" tone="gray">{t("admSupB.ai.lead", { n: turns.length })}</Text>
        </View>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} tone="gray" />
      </PressableScale>
      {open ? (
        <View style={s.body}>
          {turns.length > PREVIEW ? <PressableScale onPress={() => setAll((v) => !v)}><Text variant="small" tone="accent" weight="bold">{all ? t("admSupB.showLess") : t("admSupB.ai.earlier", { n: turns.length - PREVIEW })}</Text></PressableScale> : null}
          {shown.map((x, i) => (
            <View key={`${x.at}-${i}`} style={s.turn}>
              {x.q ? <View style={[s.bubble, { backgroundColor: c.surface2 }]}><Text variant="caption" tone="gray" weight="bold">{t("admSupB.ai.client")}{x.at ? ` · ${fmtDateTime(serverIso(x.at), locale)}` : ""}</Text><Text variant="small" selectable>{x.q}</Text></View> : null}
              {x.a ? <View style={[s.bubble, { backgroundColor: c.cyBg }]}><Text variant="caption" tone="accent" weight="bold">{t("admSupB.ai.ai")}</Text><Text variant="small" selectable>{x.a}</Text></View> : null}
            </View>
          ))}
          {history.sessionId ? <Text variant="caption" tone="gray2">{t("admSupB.ai.session", { id: history.sessionId })}</Text> : null}
        </View>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  col: { flex: 1 },
  body: { gap: 10 },
  turn: { gap: 6 },
  bubble: { padding: 10, borderRadius: 14, gap: 2 },
});
