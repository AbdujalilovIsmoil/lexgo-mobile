import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPassport, useUpdateService, type AdminService, type OverlaidCategory } from "@/entities/admin-services";
import { FormSheet } from "@/shared/ui/admin";
import { useAppForm } from "@/shared/form";
import { Skeleton, Text, toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { diffForm, seedFrom } from "../model/serviceForm";
import { serviceEditSchema } from "../model/serviceSchema";
import { BaseFields } from "./BaseFields";
import { DocTemplateSection } from "./DocTemplateSection";
import { MetaFields } from "./MetaFields";
import { PassportContext } from "./PassportContext";

type Props = { service: AdminService; visible: boolean; categories: OverlaidCategory[]; onClose: () => void };

// Full edit form. The passport (fresher catalogue metadata; inactive rows answer 404) refines the values once it has loaded.
export function ServiceEditSheet({ service, visible, categories, onClose }: Props) {
  const { t } = useT();
  const q = useQuery({ queryKey: ["admin-services", "passport", service.id], queryFn: () => getPassport(service.id), retry: false });
  const seed = useMemo(() => seedFrom(service, q.data ?? null), [service, q.data]);
  const f = useAppForm(serviceEditSchema, seed);
  const save = useUpdateService();
  const { reset } = f;
  useEffect(() => { if (!q.isLoading) reset(seed); }, [q.isLoading, seed, reset]);
  const submit = f.handleSubmit((v) => {
    const body = diffForm(seed, v, service.hasMetadata);
    if (body === "bad-number") return toast(t("admSvcB.badNumber"), "err");
    if (!Object.keys(body).length) return toast(t("admSvcB.noChanges"), "info");
    save.mutate({ id: service.id, body }, { onSuccess: onClose });
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admSvcB.editTitle")} subtitle={service.slug} onSubmit={q.isLoading ? undefined : () => void submit()} submitLabel={t("adm.save")} submitting={save.isPending} snaps={[0.85, 0.96]}>
      {q.isLoading ? <Skeleton height={160} round={20} /> : (
        <>
          {q.data ? <PassportContext p={q.data} /> : <Text variant="caption" tone="gray">{t("admSvcB.passportOff")}</Text>}
          <BaseFields f={f} categories={categories} />
          <MetaFields f={f} enabled={service.hasMetadata} />
          <DocTemplateSection service={service} />
        </>
      )}
    </FormSheet>
  );
}
