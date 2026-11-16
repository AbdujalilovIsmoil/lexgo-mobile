import { View } from "react-native";
import { FilterSeg } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { ServicesTab } from "./useServicesTab";

type Props = { value: ServicesTab; onChange: (t: ServicesTab) => void };

// "Xizmatlar | Paketlar" switch on top of the screen (Adliya: a grey track, the picked one on a white thumb).
export function ServicesTabs({ value, onChange }: Props) {
  const { t } = useT();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={t("proSvc.tabs.label")}>
      <FilterSeg<ServicesTab> value={value} onChange={onChange} options={[{ value: "services", label: t("proSvc.tabs.services") }, { value: "packages", label: t("proSvc.tabs.packages") }]} />
    </View>
  );
}
