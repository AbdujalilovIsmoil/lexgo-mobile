import { useRouter } from "expo-router";
import { useClientProfile } from "@/entities/profile-extras";
import { ProfileEditForm } from "@/widgets/profile-extras";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { PayScroll } from "@/shared/ui/pay/PayScroll";
import { useT } from "@/shared/i18n";

// Personal data of the client (GET/PUT /clients/me).
export function EditProfilePage() {
  const { t } = useT();
  const router = useRouter();
  const q = useClientProfile();
  return (
    <AdminPage title={t("py9.edit")}>
      <QueryBoundary query={q}>
        <PayScroll keyboard>{q.data ? <ProfileEditForm profile={q.data} onSaved={() => router.back()} /> : null}</PayScroll>
      </QueryBoundary>
    </AdminPage>
  );
}
