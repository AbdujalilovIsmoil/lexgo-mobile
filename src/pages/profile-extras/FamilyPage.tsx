import { ScrollView } from "react-native";
import { FamilyGroup } from "@/widgets/client-profile";
import { useClientFrame } from "@/widgets/client-dash";
import { AdminPage } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Family members who may be covered by the plan (GET/POST/PATCH/DELETE /clients/me/family-members) — the same block as the profile's
// "Oila a'zolari" section (FamilyGroup).
export function FamilyPage() {
  const frame = useClientFrame(); // the client pages' light frame (Adliya): grey ground, the pinned header
  const { t } = useT();
  const insets = useInsets();
  return (
    <AdminPage {...frame} title={t("py6.title")}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
        <FamilyGroup />
      </ScrollView>
    </AdminPage>
  );
}
