import { StyleSheet, View } from "react-native";
import type { BannerCheck } from "@/entities/promotion";
import { Icon, Text } from "@/shared/ui";
import { Notice } from "@/shared/ui/sel";
import { useColors } from "@/shared/theme";

const TONE = { active: "ok", manual_review: "warn", rejected: "err" } as const;

// The server's verdict on the uploaded picture in its own words only (already in the app's language): the message in the colour of
// the result, then its reasons and its suggestions. Nothing is added on the phone and the technical reason codes are never shown
// (TZ.md "Promotion banner AI localization"). Without a message the first reason leads.
export function BannerCheckNote({ check }: { check: BannerCheck }) {
  const c = useColors();
  const [lead, ...reasons] = check.message ? [check.message, ...check.reasons] : check.reasons;
  if (!lead && !check.suggestions.length) return null;
  const mark = check.status === "rejected" ? c.err : check.status === "manual_review" ? c.warn : c.gray;
  return (
    <View accessibilityRole="alert" style={s.box}>
      {lead ? <Notice tone={TONE[check.status]} text={lead} /> : null}
      {reasons.map((r, i) => <Line key={`r${i}`} icon="alert-circle" color={mark} text={r} />)}
      {check.suggestions.map((r, i) => <Line key={`s${i}`} icon="check" color={c.accent} text={r} />)}
    </View>
  );
}

function Line({ icon, color, text }: { icon: "alert-circle" | "check"; color: string; text: string }) {
  return (
    <View style={s.line}>
      <View style={s.icon}><Icon name={icon} size={14} color={color} /></View>
      <Text variant="small" tone="gray" style={s.text}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 6 },
  line: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  icon: { paddingTop: 2 },
  text: { flex: 1 },
});
