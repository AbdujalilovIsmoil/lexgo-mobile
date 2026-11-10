import { useRouter } from "expo-router";
import { useCaseItems } from "@/entities/client-case";
import { useIsAuthed } from "@/entities/session";
import { CasesList } from "@/widgets/client-cases";
import { EmptyState } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useTheme } from "@/shared/theme";
import { HOME_BG } from "@/widgets/client-dash";
import { useT } from "@/shared/i18n";

// /cases: "So'rovlarim" — legal cases and orders of the client (web portal/client/cases).
export function ClientCasesPage() {
  const { t } = useT();
  const router = useRouter();
  const insets = useInsets();
  const { dark } = useTheme();
  const authed = useIsAuthed();
  const cases = useCaseItems();
  return (
    <AdminPage secondary ground={dark ? undefined : HOME_BG} title={t("ccs.title")} subtitle={authed && cases.items.length ? t("ccs.count", { n: cases.items.length }) : undefined}>
      {authed ? <CasesList cases={cases} bottom={insets.bottom + 24} /> : <EmptyState icon="lock" title={t("ccs.signInTitle")} actionLabel={t("ccs.signIn")} onAction={() => router.push("/auth/login")} />}
    </AdminPage>
  );
}
