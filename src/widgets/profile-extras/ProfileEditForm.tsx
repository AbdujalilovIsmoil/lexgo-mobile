import { useState } from "react";
import { View } from "react-native";
import type { ClientProfile } from "@/entities/profile-extras";
import { profileSchema, useProfileEdit } from "@/features/profile-extras";
import { FormInput, useAppForm } from "@/shared/form";
import { Avatar, Button, Text, toast } from "@/shared/ui";
import { pickImages } from "@/shared/lib/upload";
import { toAvatarDataUrl } from "@/shared/lib/pay/avatar";
import { maskPhone } from "@/shared/lib/phone";
import { useT } from "@/shared/i18n";

// Name, e-mail and photo of the signed-in client (PUT /clients/me), validated by profileSchema. The phone is the login: read-only.
export function ProfileEditForm({ profile, onSaved }: { profile: ClientProfile; onSaved: () => void }) {
  const { t } = useT();
  const f = useAppForm(profileSchema, { name: profile.name, email: profile.email });
  const [photo, setPhoto] = useState(profile.avatarUrl);
  const [busy, setBusy] = useState(false);
  const save = useProfileEdit(onSaved);
  const v = f.watch();
  const changed = v.name.trim() !== profile.name || v.email.trim() !== profile.email || photo !== profile.avatarUrl;
  const choose = async () => {
    setBusy(true);
    try {
      const r = await pickImages({ maxMb: 15, exts: /\.(jpe?g|png|webp|heic)$/i });
      if (r?.error) toast(t(r.error === "tooBig" ? "py9.photoBig" : "py9.photoType"), "err");
      else if (r?.files[0]) setPhoto(await toAvatarDataUrl(r.files[0].uri));
    } catch {
      toast(t("py9.photoFail"), "err");
    } finally {
      setBusy(false);
    }
  };
  const submit = f.handleSubmit((x) => save.mutate({ name: x.name, email: x.email, ...(photo !== profile.avatarUrl ? { avatarUrl: photo } : {}) }));
  return (
    <View style={{ gap: 14 }}>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Avatar name={v.name || profile.phone} uri={photo || undefined} size={92} />
        <Text variant="small" tone="gray">{maskPhone(profile.phone)}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button title={t("py9.photo")} icon="camera" variant="soft" size="sm" loading={busy} onPress={() => void choose()} />
          {photo ? <Button title={t("py9.photoRemove")} icon="trash-2" variant="line" size="sm" onPress={() => setPhoto("")} /> : null}
        </View>
      </View>
      <FormInput control={f.control} name="name" label={t("py9.name")} autoCapitalize="words" placeholder={t("py9.namePh")} />
      <FormInput control={f.control} name="email" label={t("py9.email")} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholder="you@email.com" />
      <Button title={t("adm.save")} variant="gradient" full disabled={!changed} loading={save.isPending} onPress={() => void submit()} />
    </View>
  );
}
