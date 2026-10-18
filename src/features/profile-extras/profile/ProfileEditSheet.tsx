import { useState } from "react";
import type { ClientProfile } from "@/entities/profile-extras";
import { FormInput, useAppForm } from "@/shared/form";
import { FieldCard, ProfileSheet } from "@/shared/ui/profile";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { AvatarPicker } from "./AvatarPicker";
import { profileSchema } from "./profileSchema";
import { usePickAvatar } from "./usePickAvatar";
import { useProfileEdit } from "./useProfileEdit";

// Web EditModal as a bottom sheet: photo, name, e-mail -> PUT /clients/me (avatar_url only when changed). Validated by profileSchema.
export function ProfileEditSheet({ visible, profile, onClose }: { visible: boolean; profile?: ClientProfile; onClose: () => void }) {
  const { t } = useT();
  const [photo, setPhoto] = useState("");
  const f = useAppForm(profileSchema, { name: "", email: "" });
  useSheetReset(visible, () => { f.reset({ name: profile?.name ?? "", email: profile?.email ?? "" }); setPhoto(profile?.avatarUrl ?? ""); });
  const pick = usePickAvatar(setPhoto);
  const save = useProfileEdit(onClose);
  const submit = f.handleSubmit((v) => save.mutate({ name: v.name, email: v.email, ...(photo !== (profile?.avatarUrl ?? "") ? { avatarUrl: photo } : {}) }));
  return (
    <ProfileSheet visible={visible} onClose={onClose} plain title={t("py9.edit")} submitLabel={t("adm.save")} submitting={save.isPending} onSubmit={() => void submit()} snaps={[0.72, 0.94]}>
      <AvatarPicker name={f.watch("name") || profile?.phone || ""} uri={photo || undefined} busy={pick.busy} onPick={() => void pick.choose()} onRemove={() => setPhoto("")} />
      <FieldCard>
        <FormInput control={f.control} name="name" label={t("py9.name")} autoCapitalize="words" placeholder={t("py9.namePh")} />
        <FormInput control={f.control} name="email" label={t("py9.email")} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholder="you@email.com" />
      </FieldCard>
    </ProfileSheet>
  );
}
