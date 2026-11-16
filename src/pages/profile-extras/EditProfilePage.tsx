import { useRouter } from "expo-router";
import { useClientProfile } from "@/entities/profile-extras";
import { ProfileEditForm } from "@/widgets/profile-extras";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { PayScroll } from "@/shared/ui/pay/PayScroll";
import { useRaPage } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";
import { useClientFrame } from "@/widgets/client-dash";

// Personal data of the client (GET/PUT /clients/me). Remote assistance: `client.profile` (the form's fields are on the map).
export function EditProfilePage() {
  const frame = useClientFrame(); // the client pages' light frame (Adliya): grey ground, the pinned header
  const { t } = useT();
  const router = useRouter();
  const q = useClientProfile();
  useRaPage("client.profile");
  return (
    <AdminPage {...frame} title={t("py9.edit")}>
      <QueryBoundary query={q}>
        <PayScroll keyboard>{q.data ? <ProfileEditForm profile={q.data} onSaved={() => router.back()} /> : null}</PayScroll>
      </QueryBoundary>
    </AdminPage>
  );
}
