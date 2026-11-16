import { View } from "react-native";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, type IconName } from "..";
import type { Accent } from "./accents";

// The action at the right end of a section header (add / edit), Adliya's header button: a white rounded square with a hairline, the icon in
// ink. It is only an icon, so the title keeps the whole row; the full wording lives in the accessibility label and in the "add" row under the list.
export function HeadAction({ icon, label, onPress }: { accent: Accent; icon: IconName; label: string; onPress: () => void }) {
  const { colors: c, dark, glass } = useTheme();
  return (
    <PressableScale onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: dark || glass ? c.surface2 : "#FFFFFF", borderWidth: 1, borderColor: dark || glass ? c.line : "#E6EBF3", alignItems: "center", justifyContent: "center" }}>
      <View><Icon name={icon} size={19} color={c.ink} /></View>
    </PressableScale>
  );
}
