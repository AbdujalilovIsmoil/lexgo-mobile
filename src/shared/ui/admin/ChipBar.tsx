import { ScrollView } from "react-native";
import { Chip } from "../Chip";

type Option<T extends string> = { value: T; label: string; count?: number };

// Single-select filter chips in one horizontally scrolling row.
export function ChipBar<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }} keyboardShouldPersistTaps="handled">
      {options.map((o) => (
        <Chip key={o.value} label={o.count != null ? `${o.label} · ${o.count}` : o.label} active={o.value === value} onPress={() => onChange(o.value)} />
      ))}
    </ScrollView>
  );
}
