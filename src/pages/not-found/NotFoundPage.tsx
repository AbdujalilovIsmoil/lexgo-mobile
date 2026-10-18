import { View } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/shared/theme";
import { EmptyState, Header } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export function NotFoundPage() {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header />
      <EmptyState icon="compass" title={t("common.pageNotFound")} text={t("common.pageNotFoundText")} actionLabel={t("common.toHome")} onAction={() => router.replace("/")} />
    </View>
  );
}
