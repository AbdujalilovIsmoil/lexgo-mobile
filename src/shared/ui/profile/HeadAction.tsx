import { View } from "react-native";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, type IconName } from "..";
import { ACCENTS, type Accent } from "./accents";

// The round action at the right end of a section header (add / edit). It is only an icon, so the title keeps
// the whole row; the full wording lives in the accessibility label and in the dashed "add" row under the list.
export function HeadAction({ accent, icon, label, onPress }: { accent: Accent; icon: IconName; label: string; onPress: () => void }) {
  const { dark } = useTheme();
  const [from, to] = ACCENTS[accent];
  return (
    <PressableScale onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${from}26`, borderWidth: 1, borderColor: `${from}55`, alignItems: "center", justifyContent: "center" }}>
      <View><Icon name={icon} size={20} color={dark ? to : from} /></View>
    </PressableScale>
  );
}
