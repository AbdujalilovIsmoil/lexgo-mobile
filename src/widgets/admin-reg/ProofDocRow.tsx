import { useState } from "react";
import { Image, View } from "react-native";
import { useProofFile, type ProofDoc } from "@/entities/admin-reg";
import { RowCard } from "@/shared/ui/admin";
import { Button, Icon, Skeleton, Text, toast } from "@/shared/ui";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { shareFile } from "@/shared/lib/files";
import { useT } from "@/shared/i18n";

// One uploaded proof document. Opened on demand: images are shown right here, a PDF goes to the share sheet.
export function ProofDocRow({ doc }: { doc: ProofDoc }) {
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const q = useProofFile(doc.id, open);
  const file = q.data;
  const share = () => file && void shareFile(file.uri, file.mime).catch(() => toast(t("adm.actionFailed"), "err"));
  return (
    <View style={{ gap: 10 }}>
      <RowCard icon="file-text" title={doc.kind ? humanizeSlug(doc.kind) : t("admRegB.document")} meta={fmtDate(doc.createdAt, locale)} right={<Icon name={open ? "x" : "eye"} size={20} tone="gray" />} onPress={() => setOpen((v) => !v)} />
      {open && q.isLoading ? <Skeleton height={220} round={16} /> : null}
      {open && q.isError ? <Text variant="small" tone="err">{t("admRegB.fileError")}</Text> : null}
      {open && file?.mime.startsWith("image/") ? <Image source={{ uri: file.uri }} style={{ width: "100%", height: 340, borderRadius: 14 }} resizeMode="contain" /> : null}
      {open && file ? <Button title={file.mime.startsWith("image/") ? t("adm.share") : t("admRegB.openFile")} icon={file.mime.startsWith("image/") ? "share" : "file-text"} variant="soft" size="sm" onPress={share} /> : null}
    </View>
  );
}
