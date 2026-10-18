import { View } from "react-native";
import { Icon, LiveDot, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Tone = "done" | "now" | "todo" | "rework" | "ok" | "bad" | "end";
type Step = { tone: Tone; label: string; sub?: string };

const MARK: Partial<Record<Tone, IconName>> = { done: "check", rework: "refresh-cw", ok: "check", bad: "x", end: "minus" };

// Received → under review → decision (web: .shks timeline); the step that is being worked on now blinks.
export function ComplaintTimeline({ steps }: { steps: Step[] }) {
  const { t } = useT();
  const c = useColors();
  const bg: Record<Tone, string> = { done: c.ok, now: c.accent, todo: c.line, rework: c.warn, ok: c.ok, bad: c.err, end: c.gray };
  return (
    <View style={{ gap: 12 }} accessibilityLabel={t("pwc.timeline")}>
      {steps.map((s, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: bg[s.tone], alignItems: "center", justifyContent: "center" }}>
            {s.tone === "now" || s.tone === "rework" ? <LiveDot color="#FFFFFF" size={7} /> : MARK[s.tone] ? <Icon name={MARK[s.tone] as IconName} size={13} color="#FFFFFF" /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="small" weight={s.tone === "now" ? "bold" : "semibold"} tone={s.tone === "todo" ? "gray2" : "ink"}>{s.label}</Text>
            {s.sub ? <Text variant="caption" tone="gray">{s.sub}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}
