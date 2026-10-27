import { useState } from "react";
import { View } from "react-native";
import { useIdentity } from "@/entities/identity";
import { useMethods, useClientProfile } from "@/entities/profile-extras";
import { useSession } from "@/entities/session";
import { ProfileEditSheet } from "@/features/profile-extras";
import { Skeleton } from "@/shared/ui";
import { ProfileSection } from "@/shared/ui/profile";
import { RA_OPENER, raOk, useRaControl } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";
import { FactTiles } from "./FactTiles";
import { IdentityHero } from "./IdentityHero";

// Web "Shaxsiy ma'lumotlar" panel: identity card (avatar, name, verified, ID), then phone, card and e-mail tiles.
export function PersonalPanel() {
  const { t } = useT();
  const [edit, setEdit] = useState(false);
  const user = useSession()?.user;
  const q = useClientProfile();
  const card = useMethods().data?.[0];
  const ident = useIdentity().data;
  const p = q.data;
  const name = p?.name || user?.name || "—";
  // Remote assistance: the operator may open the editor (its name / e-mail fields are on the map; the photo never is).
  const editRa = useRaControl(
    {
      id: "profile.edit",
      label: t("ra.el.profileEdit"),
      actions: RA_OPENER,
      state: edit ? "selected" : "ready",
      open: () => {
        setEdit(true);
        return raOk();
      },
    },
    !!p,
  );
  return (
    <ProfileSection accent="blue" icon="user" title={t("cpr.personal")} action={{ icon: "edit-3", label: t("py9.edit"), onPress: () => setEdit(true) }}>
      {q.isLoading ? (
        <View style={{ gap: 10 }}><Skeleton height={130} round={18} /><Skeleton height={64} round={18} /></View>
      ) : (
        <>
          <View {...editRa}><IdentityHero name={name} uri={p?.avatarUrl || undefined} lexgoId={user?.lexgoId} verified={ident?.verified} onEdit={() => setEdit(true)} /></View>
          <FactTiles unset={t("cpr.notSet")} facts={[
            { icon: "phone", label: t("cpr.phone"), value: p?.phone || user?.phone },
            { icon: "credit-card", label: t("cpr.card"), value: card ? `•••• ${card.last4}` : undefined },
            { icon: "mail", label: t("cpr.email"), value: p?.email, wide: true },
          ]} />
        </>
      )}
      <ProfileEditSheet visible={edit} profile={p} onClose={() => setEdit(false)} />
    </ProfileSection>
  );
}
