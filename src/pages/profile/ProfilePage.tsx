import { View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useSession } from "@/entities/session";
import { useClientProfile } from "@/entities/profile-extras";
import { AppSettings, ProfileHeader, ProfileMenu } from "@/widgets/profile";
import { IdentityCard } from "@/widgets/identity";
import { ProfileExtrasMenu, ProfileSummary } from "@/widgets/profile-extras";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { GuestWelcome } from "@/widgets/guest-welcome";
import { HeroScroll } from "@/shared/ui";
import { ClientSections } from "./ClientSections";

function ClientHeader({ user }: { user: NonNullable<ReturnType<typeof useSession>>["user"] }) {
  return <ProfileHeader user={user} photo={useClientProfile().data?.avatarUrl} />;
}

// Signed-in users get their profile; visitors get the welcome / sign-in page.
export function ProfilePage() {
  const c = useColors();
  const insets = useInsets();
  const session = useSession();
  const role = useTabRole();
  const client = role === "client";
  const seller = role === "seller"; // a professional's links live in the sidebar
  if (!session) return <GuestWelcome />;
  return (
    <HeroScroll style={{ backgroundColor: c.canvas }} contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}>
      {client ? <ClientHeader user={session.user} /> : <ProfileHeader user={session.user} />}
      {client ? <ClientSections /> : (
        <>
          <ProfileSummary />
          <View style={{ paddingHorizontal: 16, marginTop: 14 }}><IdentityCard /></View>
        </>
      )}
      {client || seller ? null : <ProfileMenu />}
      {client || seller ? null : <ProfileExtrasMenu />}
      <AppSettings />
    </HeroScroll>
  );
}
