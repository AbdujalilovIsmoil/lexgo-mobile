import { View } from "react-native";
import { completionBody, useCompleteOrder, type ProOrder } from "@/entities/pro-order";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { Button, Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { FileChips } from "./FileChips";
import { completeSchema } from "./schema";
import { useResultFiles } from "./useResultFiles";

type Props = { order: ProOrder; visible: boolean; onClose: () => void };

// Seller completion (TZ 13): result text and/or files; empty is blocked here and by the backend (marketplace_result_required).
// The client does not accept anything: completion opens the 15-minute rating window straight away.
export function CompleteSheet({ order, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(completeSchema, { text: "" });
  const att = useResultFiles(order.roomId);
  const done = useCompleteOrder(onClose);
  useSheetReset(visible, () => { f.reset({ text: "" }); att.reset(); });
  const text = f.watch("text");
  const empty = !completionBody(text, att.files);
  const submit = f.handleSubmit((v) => { if (!completionBody(v.text, att.files)) return; done.mutate({ id: order.id, text: v.text, files: att.files }); });
  return (
    <FormSheet visible={visible} onClose={done.isPending ? () => undefined : onClose} title={t("ntd.sellerV2.done.title")} subtitle={t("ntd.sellerV2.done.lead")} onSubmit={() => void submit()} submitLabel={t("ntd.sellerV2.done.submit")} submitting={done.isPending} disabled={empty || att.busy} snaps={[0.78, 0.95]}>
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
