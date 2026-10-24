import { useState } from "react";
import { View } from "react-native";
import { blockingItems, blockingOf, completeWithResult, useChecklist, type BlockingItem } from "@/entities/market-flow";
import { completionBody, type ProOrder } from "@/entities/pro-order";
import { useFlowMutation } from "@/features/market-flow";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useColors } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { FileChips } from "./FileChips";
import { completeSchema } from "./schema";
import { useResultFiles } from "./useResultFiles";

type Props = { order: ProOrder; visible: boolean; onClose: () => void };

// Seller completion (TZ §9): result text and/or files; empty is blocked here and by the backend (marketplace_result_required). While a
// required checklist item is still open (or skipped where skipping is not allowed) the sheet lists those items instead of sending; the
// backend's own refusal (required_checklist_incomplete) is shown the same way. The client does not accept anything: completion opens the
// 15-minute rating window straight away and asks the client for the final payment.
export function CompleteSheet({ order, visible, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  const f = useAppForm(completeSchema, { text: "" });
  const att = useResultFiles(order.roomId);
  const [refused, setRefused] = useState<BlockingItem[] | null>(null);
  const ck = useChecklist(order.id, order.flow.checklistUrl, visible && !!order.flow.checklistUrl);
  const done = useFlowMutation({
    mutationFn: (v: { text: string }) => completeWithResult(order.id, v.text, att.files.map((x) => ({ id: x.fileId, name: x.fileName, url: x.downloadUrl }))),
    success: "ntd.sellerV2.done.sent",
    onSuccess: onClose,
    onError: (e) => {
      const items = blockingItems(e);
      if (items) setRefused(items);
      return !!items;
    },
  });
  useSheetReset(visible, () => { f.reset({ text: "" }); att.reset(); setRefused(null); });
  const open = blockingOf(ck.data);
  const blocked: BlockingItem[] = refused ?? open.map((i) => ({ id: i.id, title: i.title }));
  const text = f.watch("text");
  const empty = !completionBody(text, att.files);
  const submit = f.handleSubmit((v) => { if (!completionBody(v.text, att.files)) return; done.mutate({ text: v.text }); });
  if (blocked.length) {
    return (
      <FormSheet visible={visible} onClose={onClose} title={t("mf.ck.blockTitle")} subtitle={t("mf.ck.blockLead", { n: blocked.length })} onSubmit={onClose} submitLabel={t("mf.ck.open")} snaps={[0.6, 0.9]}>
        {blocked.map((b, i) => (
          <View key={b.id || b.title || i} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, backgroundColor: c.warnBg }}>
            <Icon name="alert-circle" size={16} color={c.warn} />
            <Text variant="small" style={{ flex: 1 }}>{b.title || t("mf.ck.blockedItem", { n: i + 1 })}</Text>
          </View>
        ))}
      </FormSheet>
    );
  }
  return (
    <FormSheet visible={visible} onClose={done.isPending ? () => undefined : onClose} title={t("ntd.sellerV2.done.title")} subtitle={t("ntd.sellerV2.done.lead")} onSubmit={() => void submit()} submitLabel={t("ntd.sellerV2.done.submit")} submitting={done.isPending} disabled={empty || att.busy || ck.isLoading} snaps={[0.78, 0.95]}>
      <FormInput control={f.control} name="text" label={t("ntd.sellerV2.done.text")} placeholder={t("ntd.sellerV2.done.textPh")} multiline maxLength={4000} style={{ minHeight: 120, textAlignVertical: "top" }} />
      <FileChips items={att.items} onRemove={att.remove} />
      {order.roomId ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button title={t("ntd.sellerV2.done.file")} icon="paperclip" variant="soft" size="sm" onPress={() => void att.pick(false)} />
          <Button title={t("ntd.sellerV2.done.photo")} icon="image" variant="soft" size="sm" onPress={() => void att.pick(true)} />
        </View>
      ) : null}
      <Text variant="caption" tone={empty ? "warn" : "gray2"}>{t(empty ? "ntd.sellerV2.done.needOne" : "ntd.sellerV2.done.hint")}</Text>
    </FormSheet>
  );
}
