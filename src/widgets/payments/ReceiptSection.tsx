import { useState } from "react";
import { View } from "react-native";
import { receiptPath, usePaymentVerify, fmtUzs, type PaymentRow } from "@/entities/payment";
import { FilePreview } from "@/shared/ui/preview";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { Button, Pill, Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The PDF receipt (opened in the previewer) and the server's check that it is genuine.
export function ReceiptSection({ p }: { p: PaymentRow }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const v = usePaymentVerify(p.id);
  return (
    <SectionCard title={t("py2.receipt.title")}>
      {v.isLoading ? <Skeleton height={20} width="50%" /> : v.data ? (
        <View style={{ gap: 10 }}>
          <Pill label={t(v.data.valid ? "py2.receipt.valid" : "py2.receipt.invalid")} tone={v.data.valid ? "ok" : "err"} icon={v.data.valid ? "shield" : "alert-triangle"} />
          <FactRows rows={[{ label: t("py2.receipt.paid"), value: fmtUzs(v.data.paidAmount, t) }]} />
        </View>
      ) : null}
      <Button title={t("py2.receipt.open")} icon="file-text" variant="soft" onPress={() => setOpen(true)} />
      <FilePreview visible={open} onClose={() => setOpen(false)} file={{ path: receiptPath(p.id), name: "lexgo-receipt.pdf", mime: "application/pdf" }} />
    </SectionCard>
  );
}
