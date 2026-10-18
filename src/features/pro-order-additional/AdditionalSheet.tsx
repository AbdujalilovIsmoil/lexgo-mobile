import { View } from "react-native";
import type { ProOrder } from "@/entities/pro-order";
import { OptionSections, QuotePanel } from "@/entities/price-option";
import { FormInput } from "@/shared/form";
import { Skeleton, Text, useErrorText } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";
import { useAdditional } from "./useAdditional";

type Props = { order: ProOrder; visible: boolean; onClose: () => void };

// POST /marketplace/me/orders/{id}/additional-payment-request: pick Studio options (multi-select), add a note. The order
// then waits for payment (paused, valid 24 h); the backend answers any business refusal and its text is shown.
export function AdditionalSheet({ order, visible, onClose }: Props) {
  const { t } = useT();
  const som = useSom();
  const errText = useErrorText();
  const f = useAdditional(order, visible, onClose);
  const sections = f.opts.data?.sections ?? [];
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ntd.sellerV2.add.title")} subtitle={t("ntd.sellerV2.add.paid", { sum: som(order.price) })} onSubmit={() => void f.submit()} submitLabel={t("ntd.sellerV2.add.send")} submitting={f.sending} disabled={!f.canSend} snaps={[0.8, 0.95]}>
      <Notice tone="warn" text={t("ntd.sellerV2.add.lead")} />
      {f.opts.isLoading ? <Skeleton height={120} round={16} /> : null}
      {f.opts.isError ? <Text variant="small" tone="err">{errText(f.opts.error)}</Text> : null}
      {!f.opts.isLoading && !f.opts.isError && !sections.length ? <Text variant="small" tone="gray">{t("ntd.sellerV2.add.none")}</Text> : null}
      {sections.length ? (
        <View style={{ gap: 14 }}>
          <OptionSections sections={sections} ids={f.q.ids} onToggle={f.q.toggle} />
          <QuotePanel quote={f.q.quote} pending={f.q.pending} error={f.q.error} onRetry={f.q.retry} />
          <Text variant="caption" tone="gray2">{t("ntd.sellerV2.add.estimate")}</Text>
          <FormInput control={f.form.control} name="note" label={t("ntd.sellerV2.add.note")} placeholder={t("ntd.sellerV2.add.notePh")} multiline maxLength={500} style={{ minHeight: 80, textAlignVertical: "top" }} />
        </View>
      ) : null}
    </FormSheet>
  );
}
