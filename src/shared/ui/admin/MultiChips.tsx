import { View } from "react-native";
import { Chip } from "../Chip";

// Multi-select chips (roles, channels …); the chosen values are returned as a list.
export function MultiChips({ options, value, onChange }: { options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => <Chip key={o.value} label={o.label} active={value.includes(o.value)} onPress={() => toggle(o.value)} />)}
    </View>
  );
}
