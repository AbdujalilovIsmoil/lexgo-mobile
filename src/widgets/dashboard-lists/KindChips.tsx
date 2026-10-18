import { View } from "react-native";
import { ChipBar } from "@/shared/ui/admin";

type Option<T extends string> = { value: T; label: string; count?: number };

// Filter chips that sit inside a padded list header.
export function KindChips<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ marginHorizontal: -16, paddingBottom: 12 }}>
      <ChipBar options={options} value={value} onChange={onChange} />
    </View>
  );
}
