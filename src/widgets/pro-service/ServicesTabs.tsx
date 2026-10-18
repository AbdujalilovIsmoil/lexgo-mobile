import { View } from "react-native";
import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { ServicesTab } from "./useServicesTab";

type Props = { value: ServicesTab; onChange: (t: ServicesTab) => void };

// "Xizmatlar | Paketlar" switch on top of the screen.
export function ServicesTabs({ value, onChange }: Props) {
  const { t } = useT();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={t("proSvc.tabs.label")}>
      <Segmented<ServicesTab> variant="solid" value={value} onChange={onChange} options={[{ value: "services", label: t("proSvc.tabs.services"), icon: "briefcase" }, { value: "packages", label: t("proSvc.tabs.packages"), icon: "package" }]} />
    </View>
  );
}
