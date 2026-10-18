import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Chip } from "@/shared/ui";
import { useStudioAccess } from "@/entities/admin-studio";
import { useT } from "@/shared/i18n";

// Jump to the other studio screens the user's role may open (approvals, monitoring, settings).
export function DashNav() {
  const { t } = useT();
  const a = useStudioAccess();
  const router = useRouter();
  const go = (p: string) => () => router.push(`/manage/studio/${p}` as never);
  if (!a.canReview && !a.isAdmin) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
      {a.canReview ? <Chip icon="check-square" label={t("admStudio.tabs.approvals")} onPress={go("approvals")} /> : null}
      {a.isAdmin ? <Chip icon="activity" label={t("admStudio.tabs.monitoring")} onPress={go("monitoring")} /> : null}
      {a.isAdmin ? <Chip icon="sliders" label={t("admStudio.tabs.settings")} onPress={go("settings")} /> : null}
    </ScrollView>
  );
}
