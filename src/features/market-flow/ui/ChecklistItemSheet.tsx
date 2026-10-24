import { useState } from "react";
import { View } from "react-native";
import { checkIssue, patchCheckItem, type CheckItem, type CheckStatus } from "@/entities/market-flow";
import { Button, Input, Segmented, Text, toast } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { useCheckFiles } from "../model/useCheckFiles";
import { useFlowMutation } from "../model/useFlowMutation";
import { FileRows } from "./FileRows";

type Props = { orderId: string; item: CheckItem | null; roomId: string; onClose: () => void };

// One checklist item for the seller (TZ §9): done (with the comment / files / photos it requires), skipped with a reason when the backend
// allows it, or back to pending. The client sees every change at once. Every opening starts from the item as the backend has it.
export function ChecklistItemSheet({ orderId, item: open, roomId, onClose }: Props) {
  const item = useKept(open); // the last item stays drawn while the sheet slides away
  const [opens, setOpens] = useState(0);
  const [prev, setPrev] = useState<CheckItem | null>(null);
  if (open !== prev) {
    setPrev(open);
    if (open) setOpens((n) => n + 1);
  }
  if (!item) return null;
  return <ItemForm key={`${item.id}:${opens}`} orderId={orderId} item={item} roomId={roomId} visible={!!open} onClose={onClose} />;
}

function ItemForm({ orderId, item, roomId, visible, onClose }: { orderId: string; item: CheckItem; roomId: string; visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const [status, setStatus] = useState<CheckStatus>(item.status === "pending" ? "done" : item.status);
  const [comment, setComment] = useState(item.comment);
  const files = useCheckFiles(roomId, item.files);
  const images = useCheckFiles(roomId, item.images);
  const save = useFlowMutation({
    mutationFn: () => patchCheckItem(orderId, item.id, { status, comment, files: files.files, images: item.imageRequired || images.files.length ? images.files : undefined }),
    onSuccess: () => {
      toast(t("mf.ck.saved", { title: item.title }), "ok");
      onClose();
    },
  });
  const issue = checkIssue(item, { status, comment, files: files.files.length, images: images.files.length });
  const options = [
    { value: "done" as const, label: t("mf.ck.opt.done") },
    ...(item.skipAllowed ? [{ value: "skipped_with_reason" as const, label: t("mf.ck.opt.skip") }] : []),
    { value: "pending" as const, label: t("mf.ck.opt.pending") },
  ];
  const skip = status === "skipped_with_reason";
  return (
    <FormSheet
      visible={visible}
      onClose={save.isPending ? () => undefined : onClose}
      title={item.title}
      subtitle={item.description || undefined}
      onSubmit={() => !issue && save.mutate(undefined)}
      submitLabel={t("mf.ck.save")}
      submitting={save.isPending}
      disabled={!!issue || files.busy || images.busy}
      snaps={[0.72, 0.95]}
    >
      <Text variant="caption" tone="gray">{t("mf.ck.statusLabel")}</Text>
      <Segmented options={options} value={status} onChange={setStatus} />
      {!item.skipAllowed && item.required ? <Text variant="caption" tone="gray2">{t("mf.ck.noSkipRequired")}</Text> : null}
      {status !== "pending" ? (
        <Input
          label={skip ? t("mf.ck.reason") : item.commentRequired ? t("mf.ck.commentRequired") : t("mf.ck.comment")}
          value={comment}
          onChangeText={setComment}
          placeholder={skip ? t("mf.ck.reasonPh") : t("mf.ck.commentPh")}
          multiline
          maxLength={1000}
          style={{ minHeight: 90, textAlignVertical: "top" }}
        />
      ) : null}
      {status === "done" ? (
        roomId ? (
          <>
            <FileRows items={files.items} onRemove={files.remove} />
            <FileRows items={images.items} onRemove={images.remove} />
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Button title={item.fileRequired ? t("mf.ck.filesRequired") : t("mf.ck.attach")} icon="paperclip" variant="soft" size="sm" onPress={() => void files.pick(false)} />
              <Button title={t("mf.ck.attachImage")} icon="image" variant="soft" size="sm" onPress={() => void images.pick(true)} />
            </View>
          </>
        ) : item.fileRequired || item.imageRequired ? (
          <Text variant="caption" tone="warn">{t("mf.ck.noRoom")}</Text>
        ) : null
      ) : null}
      {issue ? <Text variant="caption" tone="warn">{t(`mf.ck.${issue}`)}</Text> : null}
    </FormSheet>
  );
}
