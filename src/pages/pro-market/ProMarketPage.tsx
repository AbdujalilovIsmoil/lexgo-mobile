import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";
import { MarketFeed } from "@/widgets/market-feed";

// /pro/market — "Ishlar bozori" (a yurist) / "Imkoniyatlar" (an advokat): open orders to accept or decline, with search, filters and sort.
export default function ProMarketPage() {
  const { t } = useT();
  const advocate = useSession()?.user.role === "advocate";
  return (
    <AdminPage title={t(advocate ? "lsb.opportunities" : "lsb.marketplace")} subtitle={t("mkt.sub")}>
      <MarketFeed />
    </AdminPage>
  );
}
