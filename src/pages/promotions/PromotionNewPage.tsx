import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAccount, useMyProfile } from "@/entities/pro-profile";
import { useSession } from "@/entities/session";
import { BannerForm, PackageStep, PlacementPreview, PlacementStep, Receipt, ResultSheet, SellerRow, ServiceStep, StepHeader, TotalBar, canLeave, stepsFor, useBannerPick, useCheckoutFlow, visibleStep, type StepKey } from "@/features/promotion-checkout";
import { usePromotionLive } from "@/entities/promotion";
import { Text } from "@/shared/ui";
import { AdminPage, KeyboardLift } from "@/shared/ui/admin";
import { PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

const NAME = { banner: "placementBanner", profile_boost: "placementProfile", service_boost: "placementService" } as const;

// New promotion (web «Reklama berish») as a wizard, one focused step at a time: Joy → Paket → Banner (when the package takes one)
// → Tasdiq. A sticky bar keeps the running total in view. The payment is approved by an admin in Telegram; some packages go live at once.
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
  const [want, setWant] = useState<StepKey>("place");
  const p = f.flow.placement;
  const steps = stepsFor(f.accepts && !!f.pkg);
  const step = visibleStep(steps, want);
  const at = steps.indexOf(step);
  const last = at === steps.length - 1;
  const name = account?.name || profile?.name || "";
  const ok = canLeave(step, { placement: !!p, needsService: f.needsService, hasService: !!f.svc, hasPackage: !!f.pkg, bannerBlocked: f.bannerBlocked, ready: f.ready });
  // Why "next" is off. A picture that did not pass gets no verdict of the app's own here: the server's words are under the picture.
  const hint = step === "place" && f.hint === "service" ? "promoSeller.ck.pickServiceFirst" : step === "banner" && f.hint === "needed" ? "promoSeller.ck.bannerNeeded" : step === "banner" && f.hint === "review" ? "prm.bannerBlocked" : "";
  const note = last ? f.error : hint ? t(hint) : "";
  const go = (to: number) => setWant(steps[Math.max(0, Math.min(steps.length - 1, to))]);
  const rows = p && f.pkg
    ? [{ label: t("promoSeller.ck.placementTitle"), value: t(`promoSeller.${NAME[p]}`) }, ...(f.needsService ? [{ label: t("promoSeller.ck.service"), value: f.svc?.name ?? "" }] : []), { label: t("promoSeller.ck.package"), value: f.pkg.title }]
    : [];
  const footer = <TotalBar pkg={f.pkg} note={note} isError={!!f.error && last} canBack={at > 0} last={last} enabled={ok} busy={f.submitting} onBack={() => go(at - 1)} onNext={() => (last ? void f.submit() : go(at + 1))} />;
  return (
    <AdminPage title={t(preset.service ? "promoSeller.ck.title" : "promoSeller.ck.titleAny")} footer={footer}>
      <KeyboardLift>
        <PageScroll key={step}>
          <StepHeader steps={steps} current={step} />
          {step === "place" ? (
            <>
              <Text variant="small" tone="gray">{t(preset.service ? "promoSeller.ck.lead" : "promoSeller.ck.leadAny")}</Text>
              <PlacementStep value={p} onChange={f.setPlacement}>
                {f.needsService ? <ServiceStep services={f.services} loading={f.loadingServices} value={f.flow.serviceId} onChange={f.setService} /> : <SellerRow name={name} />}
              </PlacementStep>
            </>
          ) : null}
          {step === "package" ? <PackageStep packages={f.packages} loading={f.loadingPackages} error={f.packagesQuery.isError ? f.packagesQuery.error : null} onRetry={() => void f.packagesQuery.refetch()} value={f.flow.packageId} onChange={f.setPackage} /> : null}
          {step === "banner" ? <BannerForm banner={f.flow.banner} required={f.required} onChange={f.setBanner} onPick={banner.pick} /> : null}
          {step === "confirm" && p && f.pkg ? (
            <View style={s.gap}>
              <Text variant="h4" accessibilityRole="header">{t("promoSeller.ck.confirmLead")}</Text>
              <PlacementPreview placement={p} name={name} avatarUrl={account?.avatarUrl ?? ""} serviceTitle={f.svc?.name ?? ""} banner={f.flow.banner} label={f.pkg.surfaceLabel} />
              <Receipt pkg={f.pkg} placement={p} target={f.needsService ? (f.svc?.name ?? "—") : name} />
            </View>
          ) : null}
        </PageScroll>
      </KeyboardLift>
      <ResultSheet result={f.result} rows={rows} onRetry={f.closeResult} onClose={() => { f.closeResult(); router.replace("/pro/promotions"); }} />
    </AdminPage>
  );
}

const s = StyleSheet.create({ gap: { gap: 14 } });
