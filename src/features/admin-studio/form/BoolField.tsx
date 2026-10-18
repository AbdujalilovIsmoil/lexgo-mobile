import { View } from "react-native";
import { SwitchField } from "@/shared/ui/admin";

type Props = { label: string; value: boolean; onChange: (v: boolean) => void; readOnly?: boolean; hint?: string };

// On/off switch; in read-only mode it is shown dimmed and ignores touches.
export function BoolField({ label, value, onChange, readOnly, hint }: Props) {
  return (
    <View pointerEvents={readOnly ? "none" : "auto"} style={readOnly ? { opacity: 0.6 } : undefined}>
      <SwitchField label={label} hint={hint} value={value} onChange={onChange} />
    </View>
  );
}
