import { StyleSheet, View } from "react-native";
import { claimMode, isFinal, isOpen, statusChoices, useClaimUrgent, type UrgentRequest } from "@/entities/admin-callcenter";
import { useUrgentNav } from "@/features/admin-callcenter";
import { Button, confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type Panel = "" | "group" | "complete" | "transfer" | "cancel" | "status";
type Props = { req: UrgentRequest; meId: string; admin: boolean; close: () => void; onPanel: (p: Panel) => void };

// Everything the record's lifecycle still allows, as buttons; forms open as nested sheets.
export function UrgentSheetActions({ req, meId, admin, close, onPanel }: Props) {
  const { t } = useT();
  const claim = useClaimUrgent();
  const nav = useUrgentNav(close);
  const mode = claimMode(req, meId, admin);
  const done = isFinal(req);
  const live = !done && !isOpen(req);
  const group = req.serviceKind === "second_opinion_group";
  const takeOver = () =>
    confirmDialog({
      title: t("admCc.takeOver"), message: t("admCc.takeOverAsk"), confirmLabel: t("admCc.takeOver"), cancelLabel: t("adm.cancel"), icon: "repeat",
      onConfirm: async () => { await claim.mutateAsync(req.id); },
    });
  return (
    <View style={s.row}>
      {mode ? <Button title={t(mode === "claim" ? "admCc.claim" : "admCc.takeOver")} icon="check" size="sm" loading={claim.isPending} onPress={() => (mode === "claim" ? claim.mutate(req.id) : takeOver())} /> : null}
      {live && req.channel !== "chat" ? <Button title={t("admCc.startMeeting")} icon="video" size="sm" variant="line" loading={nav.meetingId === req.id} onPress={() => nav.startMeeting(req)} /> : null}
      {req.roomId ? <Button title={t("admCc.openChat")} icon="message-circle" size="sm" variant="line" onPress={() => nav.openChat(req)} /> : null}
      {group && !done ? <Button title={t(req.groupLawyers.length ? "admCc.regroup" : "admCc.assignGroup")} icon="users" size="sm" variant="line" onPress={() => onPanel("group")} /> : null}
      {live ? <Button title={t("admCcB.complete")} icon="check-circle" size="sm" variant="line" onPress={() => onPanel("complete")} /> : null}
      {live ? <Button title={t("admCcB.transfer")} icon="repeat" size="sm" variant="line" onPress={() => onPanel("transfer")} /> : null}
      {statusChoices(req, meId).length ? <Button title={t("admCcB.moveTo")} icon="shuffle" size="sm" variant="line" onPress={() => onPanel("status")} /> : null}
      {!done ? <Button title={t("admCcB.cancelReq")} icon="x-circle" size="sm" variant="soft" onPress={() => onPanel("cancel")} /> : null}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
