import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProfileCompleteness, usePublicProfile } from "@/entities/pro-profile";
import { useSession } from "@/entities/session";
import { DirectionsSheet, ExperienceSheet, LicenseSheet, PersonalSheet, PhotoSheet, RegionSheet, useChangePhoto } from "@/features/pro-profile-edit";
import { ProfileCompleteness, ProfileSectionRows, PublicPreviewCard, VerificationCard } from "@/widgets/pro-profile";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { ProfileBandPage } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

type Open = "personal" | "license" | "directions" | "experience" | "region" | "photo" | null;
const FROM_SECTION: Record<string, Open> = { personal: "personal", photo: "photo", kind: null, license: "license", organization: "license", experience: "directions", region: "region" };

// The seller's professional profile (GET/PUT /lawyers/me), in the client profile's look: the blue band (photo — tap to change, name, phone ·
// public ID, kind and verification chips, the pencil to the personal form, how complete the profile is), then verification, the editable
// parts and the public preview as white cards on the light ground.
export default function ProProfilePage() {
  const { t } = useT();
  const router = useRouter();
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
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  if (!p) {
    return (
      <AdminPage title={t("nav1.menu.proProfile")}>
        <QueryBoundary query={profile}>{null}</QueryBoundary>
      </AdminPage>
    );
  }
  const name = account.data?.name || p.name || "—";
  return (
    <ProfileBandPage
      name={name}
      photo={account.data?.avatarUrl || undefined}
      phone={user?.phone}
      line={p.publicId || undefined}
      chips={[t(`sl1.kind.${p.sellerType || "yurist"}`), t(p.verified ? "sl1.verified" : "sl1.unverified")]}
      onBack={back}
      onEdit={() => setOpen("personal")}
      editLabel={t("sl4.personal.title")}
      onPhoto={() => setOpen("photo")}
      photoLabel={t("sl5.photo.title")}
      bandExtra={<ProfileCompleteness percent={percent} />}
      refreshing={profile.isRefetching}
      onRefresh={reload}
    >
      <VerificationCard verified={p.verified} status={p.verificationStatus} badge={p.badgeLabel} />
      <ProfileSectionRows profile={p} name={account.data?.name ?? ""} email={account.data?.email ?? ""} done={done} onOpen={setOpen} first={1} />
      <PublicPreviewCard pub={pub.data} loading={pub.isLoading} avatarUrl={account.data?.avatarUrl ?? ""} />
      <PersonalSheet {...props} visible={open === "personal"} />
      <LicenseSheet {...props} visible={open === "license"} />
      <DirectionsSheet {...props} visible={open === "directions"} />
      <ExperienceSheet {...props} visible={open === "experience"} />
      <RegionSheet {...props} visible={open === "region"} />
      <PhotoSheet visible={open === "photo"} onClose={() => setOpen(null)} hasPhoto={!!account.data?.avatarUrl} photo={photo} />
    </ProfileBandPage>
  );
}
