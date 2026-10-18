import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, type IconName } from "../Icon";
import { Text } from "../Text";

type Props = { text: string; title?: string; tone?: "info" | "warn" | "err" | "ok"; icon?: IconName };

// A tinted note with an icon ("pending sellers are not public", "limited access" …).
export function Notice({ text, title, tone = "info", icon }: Props) {
  const c = useColors();
  const look = { info: [c.tint2, c.accent, "info"], warn: [c.warnBg, c.warn, "alert-triangle"], err: [c.errBg, c.err, "alert-circle"], ok: [c.okBg, c.ok, "check-circle"] }[tone] as [string, string, IconName];
  return (
    <View style={[s.box, { backgroundColor: look[0] }]}>
      <Icon name={icon ?? look[2]} size={18} color={look[1]} />
      <View style={s.col}>
        {title ? <Text variant="small" weight="bold" style={{ color: look[1] }}>{title}</Text> : null}
        <Text variant="small" style={{ color: tone === "info" ? c.ink : look[1] }}>{text}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", gap: 10, padding: 12, borderRadius: radius.r, alignItems: "flex-start" },
  col: { flex: 1, gap: 2 },
});
