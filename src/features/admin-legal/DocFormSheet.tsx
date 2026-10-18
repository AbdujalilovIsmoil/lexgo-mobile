import { PLACEHOLDER_MAX, useEditDoc, usePublishDoc, type ConsentDoc } from "@/entities/admin-legal";
import { FormSheet, SwitchField } from "@/shared/ui/admin";
import { Text, confirmDialog } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useKept } from "@/shared/lib/useKept";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useDirtyClose } from "@/shared/lib/useDirtyClose";
import { BLANK, seedValues } from "./docSeed";
import { docSchema } from "./docSchema";
import { useT } from "@/shared/i18n";

// Publish a new document (or a new version of one): slug, version, title, text, active and
// whether users must accept it again. Publishing changes live sign-up / sign-in, so it is confirmed.
export function DocFormSheet({ seed, edit, onClose }: { seed: Partial<ConsentDoc> | null; edit?: boolean; onClose: () => void }) {
  const { t } = useT();
  const kept = useKept(seed);
  const f = useAppForm(docSchema, BLANK);
  const publish = usePublishDoc();
  const update = useEditDoc();
  const [body, major] = f.watch(["body", "major"]);
  const isVersion = !!kept?.id;
  const isEdit = !!edit && isVersion;
  useSheetReset(!!seed, () => f.reset(seedValues(seed, isEdit)));
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const close = useDirtyClose(!!seed && JSON.stringify(f.getValues()) !== JSON.stringify(seedValues(kept, isEdit)), onClose);
  const submit = f.handleSubmit((v) =>
    confirmDialog({
      title: t("admLegal.publishConfirm"), message: t("admLegal.publishText", { slug: v.slug, version: v.version }), confirmLabel: t("admLegal.publish"), cancelLabel: t("adm.cancel"), icon: "upload-cloud",
      onConfirm: async () => {
        if (isEdit && kept?.id) await update.mutateAsync({ id: kept.id, doc: { version: v.version, title: v.title, body: v.body, active: v.active, major: v.major } });
        else await publish.mutateAsync({ slug: v.slug, version: v.version, title: v.title, body: v.body, active: v.active, major: v.major });
        onClose();
      },
    }));
  return (
    <FormSheet visible={!!seed} onClose={close} title={isEdit ? t("admLegalB.editTitle") : isVersion ? t("admLegal.newVersionTitle") : t("admLegal.newDocTitle")} submitLabel={isEdit ? t("adm.save") : t("admLegal.publish")} onSubmit={() => void submit()} submitting={publish.isPending || update.isPending} snaps={[0.8, 0.96]}>
      <FormInput control={f.control} name="slug" label={t("admLegal.slug")} format={(v) => v.toLowerCase().replace(/[^a-z0-9_]/g, "_")} editable={!isVersion} autoCapitalize="none" autoCorrect={false} placeholder="terms" />
      <FormInput control={f.control} name="version" label={t("admLegal.version")} autoCapitalize="none" placeholder="1.0" />
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      <FormInput control={f.control} name="body" label={t("admLegal.body")} multiline placeholder={t("admLegal.bodyPh")} hint={body.length > PLACEHOLDER_MAX ? t("admLegalC.chars", { chars: body.length, words }) : t("admLegal.bodyHint", { n: body.length, max: PLACEHOLDER_MAX })} style={{ minHeight: 280, textAlignVertical: "top", lineHeight: 22 }} />
      <SwitchField label={t("admLegal.major")} hint={major ? t("admLegal.majorHint") : t("admLegal.minorHint")} value={major} onChange={(v) => f.setValue("major", v)} />
      <SwitchField label={t("admLegal.activeNow")} value={f.watch("active")} onChange={(v) => f.setValue("active", v)} />
      <Text variant="caption" tone="gray2">{t("admLegal.publishHint")}</Text>
    </FormSheet>
  );
}
