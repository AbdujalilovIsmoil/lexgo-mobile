import { View } from "react-native";
import { useTheme } from "@/shared/theme";
import { Icon, type IconName } from "../Icon";
import { ACCENTS, type Accent } from "./accents";

// The leading mark of a profile section / sheet (Adliya): a soft tile in the section's hue with the line icon in that hue.
export function IconTile({ accent, icon, size = 40 }: { accent: Accent; icon: IconName; size?: number }) {
  const { dark } = useTheme();
  const [from, to] = ACCENTS[accent];
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, alignItems: "center", justifyContent: "center", backgroundColor: `${from}${dark ? "33" : "1A"}` }}>
      <Icon name={icon} size={size * 0.5} color={dark ? to : from} />
    </View>
  );
}
