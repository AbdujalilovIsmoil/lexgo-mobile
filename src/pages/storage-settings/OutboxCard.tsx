import { useState } from "react";
import { View } from "react-native";
import { discardOutbox, flushOutbox, useQueueCount } from "@/shared/cache";
import { useT } from "@/shared/i18n";
import { useIsOnline } from "@/shared/network";
import { Button, confirmDialog, Text, toast } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";

// Drafts and messages written offline wait here and go out in order when the connection returns.
export function OutboxCard() {
  const { t } = useT();
  const count = useQueueCount();
  const online = useIsOnline();
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    const r = await flushOutbox();
    setBusy(false);
    toast(t("nt3.outbox.sent", { n: r.sent }), r.left ? "info" : "ok");
  };
  const drop = () =>
    confirmDialog({ title: t("nt3.outbox.dropTitle"), message: t("nt3.outbox.dropText"), confirmLabel: t("nt3.outbox.drop"), cancelLabel: t("common.cancel"), icon: "trash-2", danger: true, onConfirm: () => void discardOutbox() });
  return (
    <SectionCard title={t("nt3.outbox.title")}>
      <Text variant="small" tone="gray">{count ? t("nt3.outbox.waiting", { n: count }) : t("nt3.outbox.empty")}</Text>
      {count ? (
        <View style={{ gap: 10 }}>
          <Button title={t("nt3.outbox.send")} icon="upload-cloud" loading={busy} disabled={!online} full onPress={() => void send()} />
          <Button title={t("nt3.outbox.drop")} variant="line" full onPress={drop} />
        </View>
      ) : null}
    </SectionCard>
  );
}
