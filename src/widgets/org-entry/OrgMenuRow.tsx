import { useRouter } from "expo-router";
import { ListRow } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useAccess } from "@/entities/access";

// "My organization" row for the profile menu (organization owners only).
export function OrgMenuRow() {
  const { t } = useT();
  const router = useRouter();
  if (!useAccess().orgOwner) return null;
  return <ListRow icon="briefcase" title={t("og1.title")} sub={t("og1.subtitle")} onPress={() => router.push("/org" as never)} />;
}
