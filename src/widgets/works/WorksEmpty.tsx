import { useRouter } from "expo-router";
import { EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { filtered: boolean; onReset: () => void };

// Nothing to list: either a filter hides everything or the client has no works yet.
export function WorksEmpty({ filtered, onReset }: Props) {
  const { t } = useT();
  const router = useRouter();
  return filtered ? (
    <EmptyState icon="search" title={t("cl1.noMatch")} text={t("cl1.noMatchText")} actionLabel={t("cl1.resetFilters")} onAction={onReset} />
  ) : (
    <EmptyState icon="briefcase" title={t("cl1.empty")} text={t("cl1.emptyText")} actionLabel={t("cl1.browseServices")} onAction={() => router.navigate("/(tabs)/services")} />
  );
}
