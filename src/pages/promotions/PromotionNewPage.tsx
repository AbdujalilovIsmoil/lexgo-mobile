import { useLocalSearchParams, useRouter } from "expo-router";
import { useAccount, useMyProfile } from "@/entities/pro-profile";
import { useSession } from "@/entities/session";
import { BannerForm, PackageStep, PlacementPreview, PlacementStep, ResultSheet, ServiceStep, SummaryCard, useBannerPick, useCheckoutFlow } from "@/features/promotion-checkout";
import { usePromotionLive } from "@/entities/promotion";
import { Button, confirmDialog } from "@/shared/ui";
import { AdminPage, KeyboardLift } from "@/shared/ui/admin";
import { PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

// New promotion: placement → service / banner → package → preview → request. The payment is approved in Telegram.
export default function PromotionNewPage() {
  const { t } = useT();
  const router = useRouter();
  const uid = useSession()?.user.id ?? "";
  const preset = useLocalSearchParams<{ service?: string; placement?: string }>();
  const f = useCheckoutFlow(uid, preset);
  const banner = useBannerPick(f.setBanner);
  const profile = useMyProfile().data;
  const account = useAccount().data;
  usePromotionLive(uid);
  const p = f.flow.placement;
  const name = account?.name || profile?.name || "";
  const ask = () =>
    confirmDialog({ title: t("sl11.confirmTitle"), message: t("sl11.confirmText"), confirmLabel: t("sl11.request"), cancelLabel: t("adm.cancel"), icon: "send", onConfirm: f.submit });
  return (
    <AdminPage title={t("sl11.title")} footer={<Button title={t("sl11.request")} icon="send" full loading={f.submitting} disabled={!f.ready} onPress={ask} />}>
      <KeyboardLift>
        <PageScroll>
          <PlacementStep value={p} onChange={f.setPlacement} />
          {p === "service_boost" ? <ServiceStep services={f.services} value={f.flow.serviceId} onChange={f.setService} /> : null}
          {p === "banner" ? <BannerForm banner={f.flow.banner} onChange={f.setBanner} busy={banner.busy} onPick={banner.pick} /> : null}
          {p ? <PackageStep packages={f.packages} loading={f.loadingPackages} value={f.flow.packageId} onChange={f.setPackage} /> : null}
          {p && f.pkg ? <PlacementPreview placement={p} name={name} avatarUrl={account?.avatarUrl ?? ""} serviceTitle={f.svc?.name ?? ""} banner={f.flow.banner} label={f.pkg.surfaceLabel} /> : null}
          {p && f.pkg ? <SummaryCard pkg={f.pkg} placement={p} target={p === "service_boost" ? (f.svc?.name ?? "—") : name} /> : null}
        </PageScroll>
      </KeyboardLift>
      <ResultSheet result={f.result} onClose={() => { f.closeResult(); router.replace("/pro/promotions"); }} />
    </AdminPage>
  );
}
