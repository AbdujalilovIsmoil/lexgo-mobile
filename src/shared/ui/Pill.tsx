import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";
import { GlassBackdrop, useGlass } from "./GlassBackdrop";
import { LiveDot } from "./LiveDot";

export type PillTone = "blue" | "cy" | "ok" | "gray" | "glass" | "err" | "warn";
type Props = { label: string; tone?: PillTone; icon?: IconName; small?: boolean; live?: boolean };

// .pill variants: --blue (default), --cy, --ok, --gray, --glass. `live` puts a blinking light in front of the label
// (a status whose process is still running).
export function Pill({ label, tone = "blue", icon, small, live }: Props) {
  const c = useColors();
  const map: Record<PillTone, { bg: string; fg: string }> = {
    blue: { bg: c.tint2, fg: c.accentStrong },
    cy: { bg: c.cyBg, fg: c.cyText },
    ok: { bg: c.okBg, fg: c.ok },
    gray: { bg: c.surface2, fg: c.gray },
    glass: { bg: "rgba(255,255,255,0.13)", fg: "#CFE2FF" },
    err: { bg: c.errBg, fg: c.err },
    warn: { bg: c.warnBg, fg: c.warn },
  };
  const { bg, fg } = map[tone];
  const lens = useGlass() && tone === "glass";
  return (
    <View style={[s.pill, { backgroundColor: lens ? "transparent" : bg }, small && s.small]}>
      {lens ? <GlassBackdrop radius={radius.pill} tint="rgba(255,255,255,0.16)" /> : null}
      {live ? <LiveDot color={fg} size={small ? 6 : 7} /> : icon ? <Icon name={icon} size={small ? 11 : 13} color={fg} /> : null}
      <Text variant="caption" weight="semibold" style={{ color: fg, fontSize: small ? 11 : 12 }}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 6, paddingHorizontal: 11, borderRadius: radius.pill, alignSelf: "flex-start" },
  small: { paddingVertical: 4, paddingHorizontal: 8 },
});
