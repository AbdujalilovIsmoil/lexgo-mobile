import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAccount } from "@/entities/pro-profile";
import { displayName, type User } from "@/entities/session";
import { IdentityCard } from "@/widgets/identity";
import { AppSettings } from "@/widgets/profile";
import { ProfileSummary } from "@/widgets/profile-extras";
import { ProfileBandPage } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

// /profile of an advokat or a yurist, in the client profile's look: the blue band (photo, name, phone · LexGo ID, the role chip, the pencil to
// edit), then the personal facts, identity verification and the app settings as white cards on the light ground (their other links live in the sidebar).
export function SellerProfile({ user, onBack }: { user: User; onBack: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const photo = useAccount().data?.avatarUrl || undefined;
  const role = t(user.role === "advocate" ? "profile.roleAdvocate" : "profile.roleLawyer");
  return (
    <ProfileBandPage
      name={displayName(user) || user.phone || ""}
      photo={photo}
      phone={user.phone}
      line={user.lexgoId ? `${t("profile.lexgoId")}: ${user.lexgoId}` : undefined}
      chips={[role]}
      onBack={onBack}
      onEdit={() => router.push("/profile/edit")}
      editLabel={t("profile.pp.edit")}
    >
      <ProfileSummary soft />
      <View style={{ paddingHorizontal: 16, marginTop: 20 }}><IdentityCard /></View>
      <AppSettings soft />
    </ProfileBandPage>
  );
}
