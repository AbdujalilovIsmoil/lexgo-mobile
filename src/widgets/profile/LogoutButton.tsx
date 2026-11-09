import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";

// Sign out: a full-width red button (white label and icon), clearly set apart from the settings above it. `outline`: red label on a red hairline, no fill.
export function LogoutButton({ title, onPress, outline }: { title: string; onPress: () => void; outline?: boolean }) {
  if (outline) {
    return (
      <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" accessibilityLabel={title} style={[s.btn, s.outline]}>
        <Icon name="log-out" size={19} color={RED} />
        <Text variant="body" weight="bold" style={{ color: RED }}>{title}</Text>
      </PressableScale>
    );
  }
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" accessibilityLabel={title} style={s.wrap}>
      <LinearGradient colors={["#EF4444", "#C81E1E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.btn}>
        <Icon name="log-out" size={19} tone="white" />
        <Text variant="body" weight="bold" tone="white">{title}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

const RED = "#EF4444";

const s = StyleSheet.create({
  wrap: { alignSelf: "stretch", marginTop: 14, shadowColor: "#C81E1E", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  btn: { width: "100%", minHeight: 54, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  outline: { marginTop: 14, borderWidth: 1.5, borderColor: "#FCA5A5" },
});
