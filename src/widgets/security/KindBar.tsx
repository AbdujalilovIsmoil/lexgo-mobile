import { View } from "react-native";
import { ChipBar } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

export type HistoryKind = "activity" | "events";

// Switch of the "Journal" tab. ChipBar pads itself by 16, so the list's own padding is cancelled around it.
export function KindBar({ value, onChange }: { value: HistoryKind; onChange: (k: HistoryKind) => void }) {
  const { t } = useT();
  return (
    <View style={{ marginHorizontal: -16 }}>
      <ChipBar options={[{ value: "activity", label: t("admSecC.kindActivity") }, { value: "events", label: t("admSecC.kindEvents") }]} value={value} onChange={onChange} />
    </View>
  );
}
