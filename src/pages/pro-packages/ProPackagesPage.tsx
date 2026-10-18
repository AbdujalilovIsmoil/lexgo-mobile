import { SellerPackageCard, useEnablePackage, usePackageStatus, useSellerPackages } from "@/entities/seller-package";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

// The seller's view of the Studio packages (GET /lawyers/me/packages/manage): enable, switch on / off. A seller can never
// create a package nor change its price or content (TZ 5.2). PREMIUM shows the backend's extended-verification text.
export default function ProPackagesPage() {
  const { t } = useT();
  const q = useSellerPackages();
  const enable = useEnablePackage();
  const status = usePackageStatus();
  const busyId = enable.isPending ? enable.variables : status.isPending ? status.variables?.id : "";
  return (
    <AdminPage title={t("ntd.sellerV2.menuPackages")}>
      <PagedList
        data={q.data ?? []}
        query={q}
        keyExtractor={(p) => p.id}
        skeletonHeight={220}
        renderItem={(p) => <SellerPackageCard pkg={p} busy={busyId === p.id} onEnable={() => enable.mutate(p.id)} onStatus={(s) => status.mutate({ id: p.id, status: s })} />}
        empty={{ icon: "package", title: t("ntd.sellerV2.pkg.empty"), text: t("ntd.sellerV2.pkg.emptyText") }}
        header={<Notice text={t("ntd.sellerV2.pkg.lead")} />}
      />
    </AdminPage>
  );
}
