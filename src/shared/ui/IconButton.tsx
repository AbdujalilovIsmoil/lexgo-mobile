import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
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
};

// Round icon button (radius = size / 2). One shape on iOS and Android, so
// header icons never differ between platforms.
export function IconButton({ icon, onPress, size = 44, tone = "tint", badge, label }: Props) {
  const c = useColors();
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
      style={[s.btn, { width: size, height: size, borderRadius: size / 2, backgroundColor: lens ? "transparent" : glass ? "rgba(255,255,255,0.10)" : c.tint2 }, glass && s.rim]}
    >
      {lens ? <GlassBackdrop radius={size / 2} tint="rgba(255,255,255,0.20)" interactive scheme="dark" /> : null}
      <Icon name={icon} size={Math.round(size * 0.46)} color={glass ? "#FFFFFF" : c.accent} />
      {badge ? <View style={[s.dot, { right: size * 0.24, top: size * 0.2, borderColor: glass ? "#13285E" : c.tint2 }]} /> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  btn: { alignItems: "center", justifyContent: "center" },
  rim: { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: "rgba(255,255,255,0.22)" },
  dot: { position: "absolute", width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, backgroundColor: "#F0443A" },
});
