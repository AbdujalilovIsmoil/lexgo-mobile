import { Icon, PressableScale } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The web .calev__x button: a small cross that removes a row.
export function RemoveX({ onPress, color }: { onPress: () => void; color?: string }) {
  const { t } = useT();
  return (
    <PressableScale onPress={onPress} hitSlop={10} accessibilityLabel={t("adm.delete")}>
      <Icon name="x" size={20} tone="gray" color={color} />
    </PressableScale>
  );
}
