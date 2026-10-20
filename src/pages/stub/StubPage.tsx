import { View } from "react-native";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { EmptyState, type IconName } from "@/shared/ui";

// Placeholder for a tab whose real page is being built (replaced by its owner slice).
export function StubPage({ icon, title }: { icon: IconName; title: string }) {
  const c = useColors();
  const insets = useInsets();
  const { t } = useT();
  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top + 24, justifyContent: "center" }}>
      <EmptyState icon={icon} title={title} text={t("fnd1.common.soon")} />
    </View>
  );
}
