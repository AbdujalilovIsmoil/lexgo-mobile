import { useRouter } from "expo-router";
import { EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Support belongs to an account: visitors are asked to sign in first.
export function SignInGate() {
  const { t } = useT();
  const router = useRouter();
  return <EmptyState icon="lock" title={t("sp1.signInTitle")} text={t("sp1.signInText")} actionLabel={t("sp1.signIn")} onAction={() => router.push("/auth/login" as never)} />;
}
