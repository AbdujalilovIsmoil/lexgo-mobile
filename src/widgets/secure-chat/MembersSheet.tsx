import { BottomSheet, SheetScroll, Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { roleKey, type Room } from "@/entities/secure-chat";
import { useT } from "@/shared/i18n";

// Who is in the chat. Phone numbers stay hidden (TZ 40).
export function MembersSheet({ visible, onClose, room, myId }: { visible: boolean; onClose: () => void; room: Room | undefined; myId: string }) {
  const { t } = useT();
  const list = room?.members ?? [];
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("ms2.membersTitle")} subtitle={t("ms2.members", { n: room?.memberCount ?? list.length })} snaps={[0.55, 0.9]}>
      <SheetScroll>
        {list.map((m) => (
          <RowCard key={m.userId} avatar={m.name || "?"} title={`${m.name || t("admChat.someone")}${m.userId === myId ? ` (${t("admMeetB.you")})` : ""}`} subtitle={roleKey(m.role) ? t(roleKey(m.role)) : undefined} />
        ))}
        {!list.length ? <Text variant="small" tone="gray" center>{t("ms2.membersNone")}</Text> : null}
      </SheetScroll>
    </BottomSheet>
  );
}
