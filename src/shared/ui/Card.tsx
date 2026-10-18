import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { radius, shadows, useColors } from "@/shared/theme";
import { PressableScale } from "./PressableScale";

type Props = ViewProps & {
  onPress?: () => void;
  padded?: boolean;
  elevated?: boolean;
  tinted?: boolean;
  style?: StyleProp<ViewStyle>;
};

// .card: surface, 20px radius, 1.5px line inset, soft shadow; tappable variant scales.
export function Card({ children, onPress, padded = true, elevated, tinted, style, ...rest }: Props) {
  const c = useColors();
  const base: ViewStyle = {
    backgroundColor: tinted ? c.tint : c.surface,
    borderColor: c.line,
    ...(elevated ? shadows.s2 : shadows.s1),
  };
  const styles = [s.card, base, padded && s.padded, style];
  if (onPress) {
    return (
      <PressableScale onPress={onPress} scale={0.985} style={styles} {...rest}>
        {children}
      </PressableScale>
    );
  }
  return (
    <View style={styles} {...rest}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  padded: { padding: 18 },
});
