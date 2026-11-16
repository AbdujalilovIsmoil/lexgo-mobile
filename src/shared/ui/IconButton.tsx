import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useTheme } from "@/shared/theme";
import { PressableScale } from "./PressableScale";
import { GlassBackdrop, useGlass } from "./GlassBackdrop";
import { Icon, type IconName } from "./Icon";

type Props = {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  tone?: "tint" | "glass";
  badge?: boolean;
  label?: string;
  glyph?: (color: string, size: number) => ReactNode; // a drawn glyph in place of the icon (same colour and size)
};

// Icon button. `tint` (on a light page): Adliya's header button — a white rounded square (radius 30% of the size) with a hairline and a soft
// shadow, the icon in ink. `glass` (on a navy band): the round translucent disc. One shape on iOS and Android.
export function IconButton({ icon, onPress, size = 44, tone = "tint", badge, label, glyph }: Props) {
  const { colors: c, dark, glass: glassTheme } = useTheme();
  const { t } = useT();
  const named = t(`a11y.icon.${icon}`);
  const glass = tone === "glass";
  const lens = useGlass() && glass; // iOS 26: a real glass disc instead of the flat translucent one
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? (named === `a11y.icon.${icon}` ? icon : named)}
      hitSlop={6}
      style={[
        s.btn,
        glass
          ? { width: size, height: size, borderRadius: size / 2, backgroundColor: lens ? "transparent" : "rgba(255,255,255,0.14)" }
          : [{ width: size, height: size, borderRadius: Math.round(size * 0.3), backgroundColor: dark || glassTheme ? c.surface2 : "#FFFFFF", borderWidth: 1, borderColor: dark || glassTheme ? c.line : "#E6EBF3" }, !(dark || glassTheme) && s.lift],
      ]}
    >
      {lens ? <GlassBackdrop radius={size / 2} tint="rgba(255,255,255,0.20)" interactive scheme="dark" /> : null}
      {glyph ? glyph(glass ? "#FFFFFF" : c.ink, Math.round(size * 0.46)) : <Icon name={icon} size={Math.round(size * 0.46)} color={glass ? "#FFFFFF" : c.ink} />}
      {badge ? <View style={[s.dot, { right: size * 0.24, top: size * 0.22 }]} /> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  btn: { alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: "#E5484D" },
  lift: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
