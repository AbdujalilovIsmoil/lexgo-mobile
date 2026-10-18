import { useRouter } from "expo-router";
import { EmptyState } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Guests browse the catalogue, but filling or generating a document needs an account.
export function LoginGate({ title }: { title: string }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <AdminPage title={title}>
      <EmptyState icon="lock" title={t("dc6.loginTitle")} text={t("dc6.loginText")} actionLabel={t("auth.submit")} onAction={() => router.push("/auth/login")} />
    </AdminPage>
  );
}
