import { ActiveRequestsList } from "@/widgets/client-dash";
import { useRaPage } from "@/shared/remote-assist";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Home's "Barchasi" and the profile's "Ishlarim": the client's active requests (the works API is closed to the client role, see WorksPage).
// Remote assistance: `client.my_works`, as on /works.
export function WorksKind() {
  const { t } = useT();
  const insets = useInsets();
  useRaPage("client.my_works");
  return <ActiveRequestsList bottom={insets.bottom + 24} lead={t("cl7.kinds.works.sub")} />;
}
