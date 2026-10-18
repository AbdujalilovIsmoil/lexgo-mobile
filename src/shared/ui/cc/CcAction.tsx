import { ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/shared/theme";
import { Icon, type IconName } from "../Icon";
import { PressableScale } from "../PressableScale";

type Props = { icon: IconName; label: string; onPress: () => void; primary?: boolean; loading?: boolean };

// Round icon button of a ticket (call, chat, assign…): primary is a gradient disc, the rest are tinted.
export function CcAction({ icon, label, onPress, primary, loading }: Props) {
  const c = useColors();
  const body = loading ? <ActivityIndicator size="small" color={primary ? "#fff" : c.accent} /> : <Icon name={icon} size={17} {...(primary ? { tone: "white" as const } : { color: c.accent })} />;
  return (
    <PressableScale onPress={onPress} disabled={loading} scale={0.88} accessibilityRole="button" accessibilityLabel={label} style={[s.btn, !primary && { backgroundColor: c.tint2 }]}>
      {primary ? <LinearGradient colors={["#1668F0", "#00CFE8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fill}>{body}</LinearGradient> : body}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  btn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  fill: { ...StyleSheet.absoluteFill as object, alignItems: "center", justifyContent: "center" },
});
