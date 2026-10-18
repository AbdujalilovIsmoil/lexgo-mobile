import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { fmtTime } from "@/shared/lib/format";
import { brand, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { serverIso } from "../lib/time";
import type { SupportAttachment, SupportMessage } from "../model/types";
import { useSupportLabels } from "./useLabels";

type Props = { m: SupportMessage; mine: boolean; compact: boolean; onRetry?: () => void; onFile?: (a: SupportAttachment) => void };
const AI = new Set(["ai", "assistant", "ai_instructor", "bot"]);

// One chat message: mine on the right (blue), the operator's on the left, system notes centred.
export function MessageBubble({ m, mine, compact, onRetry, onFile }: Props) {
  const c = useColors();
  const { t } = useT();
  const labels = useSupportLabels();
  if (m.messageType === "system" || m.senderRole === "system") return <View style={s.sys}><Text variant="caption" tone="gray" center>{m.content}</Text></View>;
  const ai = !mine && AI.has(m.senderRole);
  const fg = mine ? "#FFFFFF" : c.ink;
  const who = m.senderName || labels.role(m.senderRole);
  const failed = m.state === "failed";
  return (
    <View style={[s.row, mine ? s.mine : s.theirs, compact && { marginTop: -2 }]}>
      <View style={[s.bubble, { backgroundColor: mine ? brand.b600 : ai ? c.cyBg : c.surface2, opacity: m.state === "sending" ? 0.65 : 1 }, failed && { borderWidth: 1.5, borderColor: c.err }]}>
        {!mine && !compact && who ? <Text variant="caption" weight="bold" tone={ai ? "accent" : "gray"}>{ai ? `✦ ${who}` : who}</Text> : null}
        {m.content ? <Text variant="body" selectable style={{ color: fg }}>{m.content}</Text> : null}
        {m.attachments.map((a, i) => (
          <PressableScale key={`${a.url}-${i}`} onPress={() => onFile?.(a)} style={s.file}>
            <Icon name="paperclip" size={14} color={fg} />
            <Text variant="small" weight="semibold" numberOfLines={1} style={{ color: fg, flexShrink: 1 }}>{a.name || t("sp3.file")}</Text>
          </PressableScale>
        ))}
        <View style={s.foot}>
          {failed ? <PressableScale onPress={onRetry} hitSlop={8}><Text variant="caption" weight="bold" tone="err">{t("sp3.sendFailed")}</Text></PressableScale> : null}
          <Text variant="caption" style={{ color: mine ? "rgba(255,255,255,0.75)" : c.gray2 }}>{m.state === "sending" ? "…" : fmtTime(serverIso(m.createdAt))}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { marginVertical: 5, flexDirection: "row" },
  mine: { justifyContent: "flex-end" },
  theirs: { justifyContent: "flex-start" },
  bubble: { maxWidth: "84%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  file: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 2 },
  foot: { flexDirection: "row", alignSelf: "flex-end", alignItems: "center", gap: 8 },
  sys: { alignSelf: "center", paddingHorizontal: 16, paddingVertical: 10, maxWidth: "90%" },
});
