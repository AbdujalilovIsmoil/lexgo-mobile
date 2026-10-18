import { View } from "react-native";
import { useAddComment, useComments, useVersions, type WFile } from "@/entities/pro-files";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtBytes } from "@/shared/lib/pro/bytes";
import { tOr } from "@/shared/lib/pro/tOr";
import { FormInput, useAppForm } from "@/shared/form";
import { BottomSheet, Button, SheetScroll, Text } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { commentSchema } from "../model/fileSchemas";

// File card: facts, antivirus state, versions and the comment thread (add a comment).
export function DetailsSheet({ visible, onClose, file }: { visible: boolean; onClose: () => void; file: WFile | null }) {
  const { t, locale } = useT();
  const id = visible && file ? file.id : "";
  const versions = useVersions(id);
  const comments = useComments(id);
  const add = useAddComment();
  const f = useAppForm(commentSchema, { text: "" });
  if (!file) return null;
  const send = f.handleSubmit((v) => add.mutate({ id: file.id, text: v.text }, { onSuccess: () => f.reset() }));
  return (
    <BottomSheet visible={visible} onClose={onClose} title={file.name} snaps={[0.7, 0.94]}>
      <SheetScroll>
        <FactRows rows={[
          { label: t("aw12.fileInfo.size"), value: fmtBytes(file.size) },
          { label: t("aw12.fileInfo.type"), value: file.ext.toUpperCase() || file.mime },
          { label: t("aw12.fileInfo.date"), value: fmtDateTime(file.createdAt, locale) },
          { label: t("aw12.fileInfo.scan"), value: file.scan ? tOr(t, `aw12.scan.${file.scan}`, file.scan) : "" },
          { label: t("aw12.fileInfo.id"), value: file.workId },
        ]} />
        <SectionCard title={t("aw12.versions")}>
          {(versions.data ?? []).length ? versions.data?.map((v) => <Text key={v.id} variant="small">{`v${v.version} · ${v.name} · ${fmtDateTime(v.createdAt, locale)}${v.note ? ` · ${v.note}` : ""}`}</Text>) : <Text variant="small" tone="gray">{t("aw12.noVersions")}</Text>}
        </SectionCard>
        <SectionCard title={t("aw12.comments")}>
          {(comments.data ?? []).length ? comments.data?.map((c) => <View key={c.id}><Text variant="small" weight="bold">{c.author}</Text><Text variant="small">{c.text}</Text></View>) : <Text variant="small" tone="gray">{t("aw12.noComments")}</Text>}
          <FormInput control={f.control} name="text" placeholder={t("aw12.commentPh")} multiline />
          <Button title={t("aw12.send")} size="sm" icon="send" loading={add.isPending} onPress={() => void send()} />
        </SectionCard>
      </SheetScroll>
    </BottomSheet>
  );
}
