import { Switch } from "react-native";
import { brand, useTheme } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";

type Props = { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string };

// The app's on/off switch. The off track used to be the surface colour, which vanishes against cards and sheets;
// now it is a clearly visible slate in both themes (iOS draws it through ios_backgroundColor, Android via trackColor).
export function Toggle({ value, onChange, disabled, label }: Props) {
  const { dark } = useTheme();
  const off = dark ? "#7487B0" : "#9FB0CB";
  return (
    <Switch
      value={value}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      onValueChange={(v) => { selectHaptic(); onChange(v); }}
      trackColor={{ true: brand.b600, false: off }}
      ios_backgroundColor={off}
      thumbColor="#FFFFFF"
      style={disabled ? { opacity: 0.5 } : undefined}
    />
  );
}
