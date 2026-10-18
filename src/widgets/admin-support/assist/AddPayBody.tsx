import { View } from "react-native";
import { OptionSections, QuotePanel } from "@/entities/price-option";
import { FormInput } from "@/shared/form";
import { Button, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { ResolveAction } from "./addPayTypes";
import type { useAddPayForm } from "./useAddPayForm";

type Props = { action: ResolveAction; f: ReturnType<typeof useAddPayForm>; err: string };

// Replace: checkbox options + backend quote. Refund: the reason (and for a partial refund the so'm amount).
export function AddPayBody({ action, f, err }: Props) {
  const { t } = useT();
  const { opts, quote } = f.rq;
  return (
    <View style={{ gap: 12 }}>
      <Text variant="small" tone="gray">{t(`ntd.ccV2.pay.lead.${action}`)}</Text>
      {action === "replace_options" ? (
        <>
          {opts.isLoading ? <Skeleton height={80} round={14} /> : null}
          {opts.isError ? <Button title={t("ntd.po.retry")} variant="soft" size="sm" onPress={() => void opts.refetch()} /> : null}
          {opts.data ? <OptionSections sections={opts.data.sections} ids={quote.ids} onToggle={quote.toggle} /> : null}
          <QuotePanel quote={quote.quote} pending={quote.pending} error={quote.error} onRetry={quote.retry} />
        </>
      ) : (
        <>
          {action === "partial_refund" ? <FormInput control={f.form.control} name="amount" label={t("ntd.ccV2.pay.refundAmount")} keyboardType="number-pad" maxLength={12} format={(v) => v.replace(/\D/g, "")} /> : null}
          <FormInput control={f.form.control} name="reason" label={t("ntd.ccV2.pay.reason")} placeholder={t("ntd.ccV2.pay.reasonPh")} multiline maxLength={1000} />
          <Text variant="caption" tone="gray">{t("ntd.ccV2.pay.tgNote")}</Text>
        </>
      )}
      {err ? <Text variant="small" tone="err">{err}</Text> : null}
    </View>
  );
}
