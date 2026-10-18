import { useState } from "react";
import { View } from "react-native";
import { Button, Text, toast } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { downloadAndShare } from "@/shared/lib/files";
import { fmtMoney } from "@/shared/lib/money";
import type { B2bDocument } from "@/entities/admin-b2b";

// The generated PDF: its totals and a button that downloads it (with the auth header) and opens the share sheet.
export function DocumentResult({ doc, fileName }: { doc: B2bDocument; fileName: string }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const som = (n: number) => `${fmtMoney(n)} ${t("adm.currency")}`;
  const download = async () => {
    setBusy(true);
    try {
      await downloadAndShare(doc.fileUrl, fileName, "application/pdf");
    } catch {
      toast(t("admB2b.downloadError"), "err");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 14 }}>
      <Text variant="h4">{t("admB2b.docReady")}</Text>
      <FactRows
        rows={[
          { label: t("admB2b.total"), value: doc.total ? som(doc.total) : "" },
          { label: t("admB2b.vat", { pct: doc.vatPercent }), value: doc.vatAmount ? som(doc.vatAmount) : "" },
          { label: t("admB2b.tasks"), value: doc.taskCount != null ? String(doc.taskCount) : "" },
        ]}
      />
      <Button title={t("admB2b.download")} icon="download" loading={busy} disabled={!doc.fileUrl} onPress={download} full />
    </View>
  );
}
