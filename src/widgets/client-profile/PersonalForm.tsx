import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useClientProfile, type ClientProfile } from "@/entities/profile-extras";
import { profileSchema, useProfileEdit } from "@/features/profile-extras";
import { FormInput, useAppForm } from "@/shared/form";
import { Avatar, Button, ErrorView, FilterSelect, Icon, PressableScale, Skeleton, Text, toast } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { pickImages } from "@/shared/lib/upload";
import { toAvatarDataUrl } from "@/shared/lib/pay/avatar";
import { maskPhone } from "@/shared/lib/phone";
import { RA_FINAL, useRaControl, useRaField } from "@/shared/remote-assist";
import { LOCALES, LOCALE_LABELS, useLocaleStore, useT, type Locale } from "@/shared/i18n";

// "Shaxsiy ma'lumotlar" as one form (Adliya): the photo with a camera badge, full name, the phone (the login, read-only), e-mail, the app's
// language, the identity card (`identity`), then "Saqlash". Name, e-mail and photo go to PUT /clients/me (profileSchema); the language is
// the app's own setting and applies at once.
export function PersonalForm({ identity }: { identity?: ReactNode }) {
  const q = useClientProfile();
  if (q.isLoading) return <View style={s.col}><Skeleton height={110} round={55} style={s.center} /><Skeleton height={56} round={14} /><Skeleton height={56} round={14} /><Skeleton height={56} round={14} /></View>;
  if (!q.data) return <ErrorView error={q.error} onRetry={() => void q.refetch()} />;
  return <Form profile={q.data} identity={identity} />;
}

function Form({ profile, identity }: { profile: ClientProfile; identity?: ReactNode }) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const locale = useLocaleStore((x) => x.locale);
  const setLocale = useLocaleStore((x) => x.setLocale);
  const [open, setOpen] = useState(false);
  const f = useAppForm(profileSchema, { name: profile.name, email: profile.email });
  const [photo, setPhoto] = useState(profile.avatarUrl);
  const [busy, setBusy] = useState(false);
  const save = useProfileEdit(() => undefined);
  const v = f.watch();
  const changed = v.name.trim() !== profile.name || v.email.trim() !== profile.email || photo !== profile.avatarUrl;
  // Remote assistance: name and e-mail are personal fields on the map, Save can only be shown to the client; the photo never is on it.
  const nameRa = useRaField(f, "name", { id: "profile.full_name", label: t("ra.el.fullName"), sensitivity: "personal" });
  const emailRa = useRaField(f, "email", { id: "profile.email", label: t("ra.el.email"), sensitivity: "personal" });
  const saveRa = useRaControl({ id: "profile.save", label: t("ra.el.save"), actions: RA_FINAL, state: changed ? "ready" : "disabled" });
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
  const field = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#DCE3EE" };
  return (
    <View style={s.col}>
      <View style={s.photo}>
        <PressableScale onPress={() => void choose()} disabled={busy} scale={0.96} accessibilityRole="button" accessibilityLabel={t("py9.photo")}>
          <Avatar name={v.name || profile.phone} uri={photo || undefined} size={96} />
          <View style={[s.cam, { backgroundColor: c.accent, borderColor: c.bg }]}><Icon name="camera" size={15} color="#FFFFFF" /></View>
        </PressableScale>
        {photo ? (
          <PressableScale onPress={() => setPhoto("")} hitSlop={8} accessibilityRole="button">
            <Text variant="small" weight="semibold" tone="gray">{t("py9.photoRemove")}</Text>
          </PressableScale>
        ) : null}
      </View>
      <View {...nameRa}><FormInput control={f.control} name="name" label={t("py9.name")} autoCapitalize="words" placeholder={t("py9.namePh")} /></View>
      <View style={s.group}>
        <Text variant="small" tone="gray" weight="semibold" style={s.label}>{t("cpr.phone")}</Text>
        <View style={[s.readonly, field]}><Text variant="body" style={s.value}>{maskPhone(profile.phone)}</Text></View>
      </View>
      <View {...emailRa}><FormInput control={f.control} name="email" label={t("py9.email")} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholder="you@email.com" /></View>
      <View style={s.group}>
        <Text variant="small" tone="gray" weight="semibold" style={s.label}>{t("cdash.side.lang")}</Text>
        <FilterSelect label={t("cdash.side.lang")} options={LOCALES.map((l) => ({ value: l, label: LOCALE_LABELS[l] }))} value={locale} onChange={(l) => setLocale(l as Locale)} open={open} onToggle={() => setOpen((o) => !o)} />
      </View>
      {identity}
      <View {...saveRa}><Button title={t("adm.save")} variant="primary" size="lg" full disabled={!changed} loading={save.isPending} onPress={() => void submit()} /></View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 16 },
  center: { alignSelf: "center", width: 110 },
  photo: { alignItems: "center", gap: 8, marginBottom: 2 },
  cam: { position: "absolute", right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  group: { gap: 8 },
  label: { fontSize: 14 },
  readonly: { minHeight: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, justifyContent: "center" },
  value: { fontSize: 16 },
});
