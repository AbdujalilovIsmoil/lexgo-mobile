import { useState } from "react";
import { View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { checkIssue, codeOf, flowKeys, patchCheckItem, type CheckIssue, type CheckItem, type CheckStatus, type Checklist } from "@/entities/market-flow";
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

// The checklist codes of TZ §18 shown in place, next to what they ask for (the sheet stays open).
const INLINE: Record<string, CheckIssue> = {
  skip_reason_required: "needReason",
  checklist_comment_required: "needComment",
  checklist_image_required: "needImage",
  checklist_file_required: "needFile",
};

function ItemForm({ orderId, item, roomId, visible, onClose }: { orderId: string; item: CheckItem; roomId: string; visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const qc = useQueryClient();
  const [status, setStatus] = useState<CheckStatus>(item.status === "pending" ? "done" : item.status);
  const [comment, setComment] = useState(item.comment);
  // A refusal stays shown until the comment, the status or the attached proof changes.
  const [refused, setRefused] = useState<{ issue: CheckIssue; files: number; images: number } | null>(null);
  const files = useCheckFiles(roomId, item.files);
  const images = useCheckFiles(roomId, item.images);
  // Done keeps the comment and the proof; a skip keeps only its reason; back to pending clears everything (TZ §9.5).
  const patch = () => (status === "done" ? { status, comment, files: files.files, images: images.files } : { status, comment: status === "pending" ? "" : comment, files: [], images: [] });
  const save = useFlowMutation({
    mutationFn: () => patchCheckItem(orderId, item.id, patch()),
    onSuccess: (fresh) => {
      // The answer's item goes on screen at once; the list is read again in the background (useFlowMutation).
      if (fresh) qc.setQueryData<Checklist>(flowKeys.ck(orderId), (old) => (old ? { ...old, items: old.items.map((i) => (i.id === fresh.id ? fresh : i)) } : old));
      toast(t("mf.ck.saved", { title: item.title }), "ok");
      onClose();
    },
    onError: (e) => {
      const inline = INLINE[codeOf(e)];
      if (inline) setRefused({ issue: inline, files: files.files.length, images: images.files.length });
      return !!inline;
    },
  });
  const stillRefused = refused && refused.files === files.files.length && refused.images === images.files.length ? refused.issue : null;
  const issue = checkIssue(item, { status, comment, files: files.files.length, images: images.files.length }) ?? stillRefused;
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
      <Segmented options={options} value={status} onChange={(v) => { setStatus(v); setRefused(null); }} />
      {!item.skipAllowed && item.required ? <Text variant="caption" tone="gray2">{t("mf.ck.noSkipRequired")}</Text> : null}
      {status !== "pending" ? (
        <Input
          label={skip ? t("mf.ck.reason") : item.commentRequired ? t("mf.ck.commentRequired") : t("mf.ck.comment")}
          value={comment}
          onChangeText={(v) => { setComment(v); setRefused(null); }}
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
