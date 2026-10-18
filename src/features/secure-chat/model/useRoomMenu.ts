import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys, deleteRoom, isClosed, setRoomTtl, type Room } from "@/entities/secure-chat";
import { confirmDialog } from "@/shared/ui";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";
import type { ActionItem } from "@/shared/ui/admin";
import { urgentRecord } from "./useCompleteChat";

export const TTL_OPTIONS = [0, 24, 168, 720];
type Hooks = { myId: string; onMembers: () => void; onTtl: () => void; onComplete: () => void };

// TTL ("messages vanish after N hours") and archiving the chat; both are the server's decision (403 → its message).
export function useRoomSettings(roomId: string) {
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useT();
  const ttl = useAdminMutation({ mutationFn: (h: number) => setRoomTtl(roomId, h), invalidate: [chatKeys.rooms], success: "admChatB.ttlSaved" });
  const remove = useAdminMutation({ mutationFn: () => deleteRoom(roomId), success: "admChat.deleted", onSuccess: () => { void qc.invalidateQueries({ queryKey: chatKeys.rooms }); router.back(); } });
  const askDelete = () => confirmDialog({ title: t("admChat.deleteChat"), message: t("admChat.deleteText"), confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: () => remove.mutateAsync() });
  return { ttl, askDelete };
}

// "…" menu of a room: members, auto-delete window, closing a Tezkor Advokat chat (advocate / operator side only) and deleting.
export function useRoomMenu(room: Room | undefined, h: Hooks & { askDelete: () => void }): ActionItem[] {
  const { t } = useT();
  const advocateSide = !!room && room.clientId !== h.myId && !!urgentRecord(room) && !isClosed(room);
  return [
    { key: "members", icon: "users", label: t("ms2.members", { n: room?.memberCount ?? 0 }), onPress: h.onMembers },
    { key: "ttl", icon: "clock", label: `${t("admChatB.ttl")}: ${t(`admChatB.ttlOpt.${room?.ttlHours ?? 0}`)}`, onPress: h.onTtl },
    ...(advocateSide ? [{ key: "complete", icon: "check-square" as const, label: t("ms2.complete"), onPress: h.onComplete }] : []),
    { key: "del", icon: "trash-2", label: t("admChat.deleteChat"), danger: true, onPress: h.askDelete },
  ];
}
