import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { Inline } from "./Inline";
import { agentBlocks } from "../../lib/agentAnswer";
import { AgentBlock } from "./AgentBlock";
import { AgentFoot, type Agent } from "./AgentFoot";
import { parseBlocks } from "./parseBlocks";

type Props = { text: string; color: string; linkColor: string; mutedColor: string; agent?: Agent };

// Markdown of an assistant answer as real blocks: paragraphs, hanging list items, quote bars.
export function AiMarkdown({ text, color, linkColor, mutedColor, agent }: Props) {
  const blocks = useMemo(() => agentBlocks(parseBlocks(text)), [text]);
  const inline = (t: string) => <Inline text={t} linkColor={linkColor} codeBg="rgba(127,127,127,0.18)" />;
  return (
    <View style={s.root}>
      {blocks.map((b, i) => {
        if (b.kind === "lead" || b.kind === "note" || b.kind === "footer" || b.kind === "followups") {
          return <AgentBlock key={i} block={b} inline={inline} color={color} accent={linkColor} muted={mutedColor} onAsk={agent?.interactive ? agent.onAsk : undefined} />;
        }
        if (b.kind === "hr") return <View key={i} style={[s.hr, { backgroundColor: mutedColor }]} />;
        if (b.kind === "li") {
          return (
            <View key={i} style={s.li}>
              <Text variant="body" style={[s.mark, { color: mutedColor }]}>{b.mark}</Text>
              <Text variant="body" style={[s.flex, { color }]}>{inline(b.text)}</Text>
            </View>
          );
        }
        if (b.kind === "quote") {
          return (
            <View key={i} style={[s.quote, { borderLeftColor: linkColor }]}>
              <Text variant="small" style={{ color: mutedColor }}>{inline(b.text)}</Text>
            </View>
          );
        }
        return (
          <Text key={i} variant="body" weight={b.kind === "h" ? "bold" : undefined} style={{ color }}>
            {inline(b.text)}
          </Text>
        );
      })}
      {agent ? <AgentFoot text={text} agent={agent} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { gap: 8 },
  flex: { flex: 1 },
  li: { flexDirection: "row", gap: 6 },
  mark: { minWidth: 20 },
  quote: { borderLeftWidth: 3, paddingLeft: 10, marginLeft: 22 },
  hr: { height: StyleSheet.hairlineWidth, opacity: 0.5 },
});
