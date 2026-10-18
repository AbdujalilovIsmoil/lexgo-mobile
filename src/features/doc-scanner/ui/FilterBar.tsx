import { ScrollView } from "react-native";
import { SCAN_FILTERS, type ScanFilter } from "@/shared/lib/scan/filters";
import { useT } from "@/shared/i18n";
import { Chip, type IconName } from "@/shared/ui";

const LABEL: Record<ScanFilter, string> = { original: "scn.fOriginal", document: "scn.fDocument", color: "scn.fColor", gray: "scn.fGray", bw: "scn.fBw" };
const ICON: Record<ScanFilter, IconName> = { original: "image", document: "file-text", color: "sun", gray: "moon", bw: "square" };

// The scanner look, applied to every page: original, document (flat, high contrast), colour, grey, black & white.
export function FilterBar({ value, onChange }: { value: ScanFilter; onChange: (f: ScanFilter) => void }) {
  const { t } = useT();
  return (
    <ScrollView horizontal accessibilityLabel={t("scn.filters")} showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
      {SCAN_FILTERS.map((f) => <Chip key={f} label={t(LABEL[f])} icon={ICON[f]} active={value === f} onPress={() => onChange(f)} />)}
    </ScrollView>
  );
}
