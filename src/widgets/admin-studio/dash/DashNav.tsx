import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Chip } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Shortcut from the studio home to the creation journeys (the sections themselves are in StudioNav).
export function DashNav() {
  const { t } = useT();
  const router = useRouter();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
      <Chip icon="git-merge" label={t("admStudioD.jlist.listTitle")} onPress={() => router.push("/manage/studio/create" as never)} />
    </ScrollView>
  );
}
