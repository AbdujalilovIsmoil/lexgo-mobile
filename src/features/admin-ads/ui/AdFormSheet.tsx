import { useCreateAd, useUpdateAd, AD_STATUSES, type Ad } from "@/entities/admin-ads";
import { ChipBar, FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { adDefaults, adSchema } from "../model/adSchema";

// Create (ad = null) or edit one ad product: title, description, price and — when editing — the free-text status.
export function AdFormSheet({ ad, visible, onClose }: { ad: Ad | null; visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(adSchema, adDefaults(ad));
  const create = useCreateAd();
  const update = useUpdateAd();
  const submit = f.handleSubmit((v) => {
    const price = parseInt(v.price, 10) || 0;
    if (ad) update.mutate({ id: ad.id, body: { title: v.title, price, status: v.status || undefined, payload: { ...ad.payload, description: v.description } } }, { onSuccess: onClose });
    else create.mutate({ title: v.title, price, payload: { description: v.description } }, { onSuccess: onClose });
  });
  const known = AD_STATUSES.map((s) => ({ value: s, label: t(`admAds.status.${s}`) }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={ad ? t("admAds.editTitle") : t("admAds.create")} subtitle={ad?.workId} onSubmit={() => void submit()} submitLabel={ad ? t("adm.save") : t("adm.create")} submitting={create.isPending || update.isPending} snaps={[0.7, 0.94]}>
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      <FormInput control={f.control} name="description" label={t("adm.description")} multiline style={{ minHeight: 90, textAlignVertical: "top" }} />
      <FormInput control={f.control} name="price" label={t("adm.price")} format={(x) => x.replace(/\D/g, "")} keyboardType="number-pad" placeholder="0" />
      {ad ? (
        <>
          <FormInput control={f.control} name="status" label={t("admAds.statusLabel")} autoCapitalize="none" placeholder="active" />
          <Text variant="caption" tone="gray">{t("admAds.statusHint")}</Text>
          <ChipBar options={known} value={f.watch("status")} onChange={(x) => f.setValue("status", x)} />
        </>
      ) : null}
    </FormSheet>
  );
}
