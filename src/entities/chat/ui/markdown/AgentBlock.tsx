import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import type { Block } from "./parseBlocks";

type Props = { block: Extract<Block, { kind: "lead" | "note" | "footer" | "followups" }>; inline: (t: string) => React.ReactNode; color: string; accent: string; muted: string; onAsk?: (q: string) => void };

// The legal agent's own shapes: "Qisqa javob" lead, info note, closing source line and quick-reply questions.
export function AgentBlock({ block: b, inline, color, accent, muted, onAsk }: Props) {
  if (b.kind === "lead") {
    return (
      <View style={[s.lead, { borderColor: accent }]}>
        <Text variant="caption" weight="bold" style={{ color: accent }}>{b.label}</Text>
        <Text variant="body" style={{ color }}>{inline(b.text)}</Text>
      </View>
    );
  }
  if (b.kind === "followups") {
    return (
      <View style={s.fu}>
        <Text variant="small" weight="bold" style={{ color }}>{b.title}</Text>
        {b.items.map((q, i) => (
          <PressableScale key={i} disabled={!onAsk} onPress={() => onAsk?.(q)} style={[s.chip, { borderColor: accent, opacity: onAsk ? 1 : 0.55 }]}>
            <Text variant="small" style={[s.flex, { color }]}>{q}</Text>
            <Icon name="arrow-right" size={14} color={accent} />
          </PressableScale>
        ))}
      </View>
    );
  }
  return (
    <View style={s.row}>
      <Icon name={b.kind === "footer" ? "shield" : "info"} size={14} color={muted} />
      <Text variant="caption" style={[s.flex, { color: muted, fontStyle: b.kind === "note" ? "italic" : "normal" }]}>{inline(b.text)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  lead: { borderLeftWidth: 3, paddingLeft: 10, gap: 3 },
  fu: { gap: 6, marginTop: 4 },
  chip: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  flex: { flex: 1 },
});
