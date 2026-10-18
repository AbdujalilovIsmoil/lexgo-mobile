import { useState } from "react";
import { View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { Button, Input, Text, toast } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { uploadDocTemplate, type AdminService, type DocxFile } from "@/entities/admin-services";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { pickDocx } from "../model/pickDocx";

// Upload a DOCX with {{field}} placeholders: it attaches to the service and gives its card a document builder.
export function DocTemplateSection({ service }: { service: AdminService }) {
  const { t } = useT();
  const qc = useQueryClient();
  const [file, setFile] = useState<DocxFile | null>(null);
  const [slug, setSlug] = useState(service.slug);
  const [title, setTitle] = useState(service.title || service.name);
  const [attached, setAttached] = useState(!!service.documentTemplateId);
  const up = useMutation({
    mutationFn: (f: DocxFile) => uploadDocTemplate(service.id, f, { slug: slug.trim() || service.slug, title: title.trim() || service.title, price: service.basePrice ?? 0 }),
    onSuccess: (n) => { successHaptic(); toast(t("admSvcB.docDone", { n }), "ok"); setAttached(true); setFile(null); void qc.invalidateQueries({ queryKey: ["admin-services"] }); },
    onError: (e) => { errorHaptic(); const s = e instanceof ApiError ? e.status : 0; toast(s === 415 ? t("admSvcB.onlyDocx") : s === 413 ? t("admSvcB.tooBig") : e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err"); },
  });
  const pick = async () => {
    const r = await pickDocx();
    if (r === "badType") toast(t("admSvcB.onlyDocx"), "err");
    else if (r) setFile(r);
  };
  return (
    <SectionCard title={t("admSvcB.docTitle")}>
      <Text variant="small" tone="gray">{t("admSvcB.docLead")}</Text>
      {attached ? <Text variant="small" tone="ok">{t("admSvcB.docAttached")}</Text> : null}
      <Input label={t("admSvcB.docSlug")} value={slug} onChangeText={(x) => setSlug(x.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} autoCapitalize="none" />
      <Input label={t("admSvcB.docName")} value={title} onChangeText={setTitle} />
      <View style={{ gap: 8 }}>
        <Button title={file ? file.name : t("admSvcB.docPick")} icon="file-text" variant="line" onPress={() => void pick()} />
        {file ? <Button title={attached ? t("admSvcB.docReplace") : t("admSvcB.docUpload")} icon="upload" loading={up.isPending} onPress={() => up.mutate(file)} /> : null}
      </View>
    </SectionCard>
  );
}
