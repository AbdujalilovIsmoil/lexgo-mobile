import { useState } from "react";
import { activeSince, usePending, usePromoStatus, usePromotionLive, promotionKeys } from "@/entities/promotion";
import { useProServices } from "@/entities/pro-service";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/entities/session";
import { PendingList } from "@/widgets/promotion";
import { AdminPage } from "@/shared/ui/admin";
import { PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";
import { useAutoRefresh } from "./useAutoRefresh";
import { ActiveSection } from "./ui/ActiveSection";
import { Intro } from "./ui/Intro";
import { PlacementList } from "./ui/PlacementList";
import { ReachCard } from "./ui/ReachCard";
import { ServiceRows } from "./ui/ServiceRows";

// Seller promotions (web «Profilingizni targ'ib qiling»), action first: heading → what runs now («Faol targ'ib») → waiting requests → the three ad placements
// (each card is the button to buy) → reach numbers with the 14-day trend → per-service promotion.
export default function PromotionsPage() {
  const { t } = useT();
  const qc = useQueryClient();
  const uid = useSession()?.user.id ?? "";
  const status = usePromoStatus();
  const services = useProServices();
  const pending = usePending(uid);
  const [busy, setBusy] = useState(false);
  usePromotionLive(uid);
  useAutoRefresh();
  const running = status.data?.items ?? [];
  const refresh = async () => {
    setBusy(true);
    await Promise.all([qc.invalidateQueries({ queryKey: promotionKeys.all }), services.refetch()]).catch(() => {});
    setBusy(false);
  };
  return (
    <AdminPage title={t("nav1.menu.promotions")}>
      <PageScroll onRefresh={() => void refresh()} refreshing={busy} gap={22}>
        <ActiveSection items={running} />
        <Intro />
        <PendingList items={pending.pending} />
        <PlacementList running={running} pending={pending.pending} loading={status.isLoading} />
        <ReachCard since={activeSince(running)} />
        <ServiceRows running={running} />
      </PageScroll>
    </AdminPage>
  );
}
