import { type Message, stLabel, useNames } from "@/entities/admin-hrm";
import { FactRows, FormSheet } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// One direct message in full; incoming ones can be answered (the composer opens with the sender preselected).
export function MessageSheet({ item: current, me, onClose, onReply }: { item: Message | null; me: string; onClose: () => void; onReply: (userId: string, name: string) => void }) {
  const { t, locale } = useT();
  const item = useKept(current);
  const names = useNames();
  const out = item?.senderId === me;
  const peerId = item ? (out ? item.recipientId : item.senderId) : "";
  const peer = names.user(peerId) || t("admHrm.colleague");
  return (
    <FormSheet
      visible={!!current} onClose={onClose} title={out ? t("admHrm.msgTo", { name: peer }) : peer} subtitle={item ? fmtDateTime(item.createdAt, locale) : undefined}
      onSubmit={item && peerId ? () => onReply(peerId, peer) : undefined} submitLabel={t("admHrm.reply")}
    >
      {item ? (
        <>
          {item.subject ? <Text variant="body" weight="bold">{item.subject}</Text> : null}
          <Text variant="body" selectable>{item.body}</Text>
          <FactRows rows={[{ label: t("admHrm.from"), value: item.senderId === me ? t("admHrm.you") : names.user(item.senderId) }, { label: t("adm.status"), value: stLabel(t, item.status) }]} />
        </>
      ) : null}
    </FormSheet>
  );
}
