import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { PressableScale } from "./PressableScale";
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
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? (named === `a11y.icon.${icon}` ? icon : named)}
      hitSlop={6}
      style={[s.btn, { width: size, height: size, borderRadius: size / 2, backgroundColor: glass ? "rgba(255,255,255,0.14)" : c.tint2 }]}
    >
      <Icon name={icon} size={Math.round(size * 0.46)} color={glass ? "#FFFFFF" : c.accent} />
      {badge ? <View style={[s.dot, { right: size * 0.24, top: size * 0.22 }]} /> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  btn: { alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: "#00CFE8" },
});
