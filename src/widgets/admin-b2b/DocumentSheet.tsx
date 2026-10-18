import { useState } from "react";
import { Text } from "@/shared/ui";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useAppForm } from "@/shared/form";
import { useKept } from "@/shared/lib/useKept";
import { useMakeDocument, type B2bClient, type B2bDocument, type DocKind } from "@/entities/admin-b2b";
import { DocumentResult } from "./DocumentResult";
import { InvoiceFields } from "./InvoiceFields";
import { monthOptions } from "./months";
import { documentSchema } from "./b2bSchema";

export type DocTarget = { kind: DocKind; client: B2bClient };

// Invoice (amount + VAT), contract or monthly report for one client; the PDF is made on the server.
export function DocumentSheet({ target, onClose }: { target: DocTarget | null; onClose: () => void }) {
  const { t, locale } = useT();
  const shown = useKept(target);
  const make = useMakeDocument();
  const [seen, setSeen] = useState(target);
  const kind = shown?.kind ?? "contract";
  const f = useAppForm(documentSchema(kind), { amount: "", description: "" });
  const [month, setMonth] = useState(() => monthOptions(locale, 1)[0].value);
  const [out, setOut] = useState<B2bDocument | null>(null);
  if (target !== seen) {
    setSeen(target);
    setOut(null);
    f.reset({ amount: "", description: "" });
  }
  const base = parseInt(f.watch("amount").replace(/\D/g, "") || "0", 10) || 0;
  const run = f.handleSubmit((v) => target && make.mutate({ kind: target.kind, client: target.client, amount: parseInt(v.amount.replace(/\D/g, "") || "0", 10) || 0, description: v.description, month }, { onSuccess: setOut }));
  return (
    <FormSheet visible={!!target} onClose={onClose} title={t(`admB2b.${kind}`)} subtitle={shown?.client.name} onSubmit={out ? undefined : () => void run()} submitLabel={t("admB2b.generate")} submitting={make.isPending}>
      {out && shown ? (
        <DocumentResult doc={out} fileName={`${kind}-${shown.client.name}.pdf`} />
      ) : kind === "invoice" ? (
        <InvoiceFields f={f} amount={base} />
      ) : kind === "report" ? (
        <SelectField label={t("admB2b.month")} value={month} options={monthOptions(locale)} onChange={setMonth} />
      ) : (
        <Text variant="body" tone="gray">{t("admB2b.contractLead")}</Text>
      )}
    </FormSheet>
  );
}
