import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useProfileCompleteness, usePublicProfile } from "@/entities/pro-profile";
import { useSession } from "@/entities/session";
import { DirectionsSheet, ExperienceSheet, LicenseSheet, PersonalSheet, PhotoSheet, RegionSheet, useChangePhoto } from "@/features/pro-profile-edit";
import { ProfileHeaderCard, ProfileSectionRows, PublicPreviewCard, VerificationCard } from "@/widgets/pro-profile";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

type Open = "personal" | "license" | "directions" | "experience" | "region" | "photo" | null;
const FROM_SECTION: Record<string, Open> = { personal: "personal", photo: "photo", kind: null, license: "license", organization: "license", experience: "directions", region: "region" };

// The seller's professional profile (GET/PUT /lawyers/me): header, verification, edit forms, public preview.
export default function ProProfilePage() {
  const { t } = useT();
  const user = useSession()?.user;
  const { section } = useLocalSearchParams<{ section?: string }>();
  const { sections: secs, percent, profile, account } = useProfileCompleteness();
  const pub = usePublicProfile(user?.id ?? "");
  const photo = useChangePhoto();
  const [open, setOpen] = useState<Open>(section ? (FROM_SECTION[section] ?? null) : null);
  const p = profile.data;
  const done = Object.fromEntries(secs.map((x) => [x.key, x.done])) as Record<(typeof secs)[number]["key"], boolean>;
  const props = { visible: false, onClose: () => setOpen(null), userId: user?.id ?? "", profile: p! };
  const reload = () => void Promise.all([profile.refetch(), account.refetch(), pub.refetch()]);
  return (
    <AdminPage title={t("nav1.menu.proProfile")}>
      <QueryBoundary query={profile}>
        {p ? (
          <PageScroll onRefresh={reload} refreshing={profile.isRefetching}>
            <ProfileHeaderCard profile={p} name={account.data?.name ?? ""} avatarUrl={account.data?.avatarUrl ?? ""} percent={percent} onPhoto={() => setOpen("photo")} />
            <VerificationCard verified={p.verified} status={p.verificationStatus} badge={p.badgeLabel} />
            <ProfileSectionRows profile={p} name={account.data?.name ?? ""} email={account.data?.email ?? ""} done={done} onOpen={setOpen} />
            <PublicPreviewCard pub={pub.data} loading={pub.isLoading} avatarUrl={account.data?.avatarUrl ?? ""} />
            <PersonalSheet {...props} visible={open === "personal"} />
            <LicenseSheet {...props} visible={open === "license"} />
            <DirectionsSheet {...props} visible={open === "directions"} />
            <ExperienceSheet {...props} visible={open === "experience"} />
            <RegionSheet {...props} visible={open === "region"} />
            <PhotoSheet visible={open === "photo"} onClose={() => setOpen(null)} hasPhoto={!!account.data?.avatarUrl} photo={photo} />
          </PageScroll>
        ) : null}
      </QueryBoundary>
    </AdminPage>
  );
}
