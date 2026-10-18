import { useRouter } from "expo-router";
import { EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// A visitor has no works: ask to sign in.
export function WorksGuest() {
  const { t } = useT();
  const router = useRouter();
  return <EmptyState icon="lock" title={t("cl1.signInTitle")} text={t("cl1.signInText")} actionLabel={t("cl1.signIn")} onAction={() => router.push("/auth/login")} />;
}
