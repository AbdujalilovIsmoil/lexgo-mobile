import { StyleSheet } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { brand, radius } from "@/shared/theme";

type Props = { label: string; icon: IconName; onPress: () => void; big?: boolean; onGreen?: boolean };

// The one primary action of a meeting: a short pill ("Join"), 44pt tall; `big` is the full-width 52pt one on the live card.
export function JoinButton({ label, icon, onPress, big, onGreen }: Props) {
  const fg = onGreen ? "#0E7A4F" : "#FFFFFF";
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[s.btn, big && s.big, { backgroundColor: onGreen ? "#FFFFFF" : brand.b600 }]}>
      <Icon name={icon} size={big ? 20 : 17} color={fg} />
      <Text variant={big ? "body" : "small"} weight="bold" style={{ color: fg }} numberOfLines={1}>{label}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill },
  big: { minHeight: 52, alignSelf: "stretch" },
});
