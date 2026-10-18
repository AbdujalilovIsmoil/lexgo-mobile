import { View } from "react-native";
import { STATUSES, type RStatus } from "@/entities/admin-aireg";
import { Segmented, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Active / draft / archived as a glide-thumb segment with a one-line explanation of the chosen state.
export function StatusField({ value, onChange }: { value: RStatus; onChange: (v: RStatus) => void }) {
  const { t } = useT();
  return (
    <View style={{ gap: 6 }}>
      <Text variant="small" weight="semibold">{t("adm.status")}</Text>
      <Segmented options={STATUSES.map((s) => ({ value: s, label: t(`admAiReg.status.${s}`) }))} value={value} onChange={onChange} />
      <Text variant="caption" tone="gray">{t(`admAiRegB.statusHint.${value}`)}</Text>
    </View>
  );
}
