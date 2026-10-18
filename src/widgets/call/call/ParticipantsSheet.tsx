import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, IconButton, SheetScroll, Text, confirmDialog } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import type { Participant, Perms } from "@/entities/call";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; roster: Participant[]; live: Map<string, { mic: boolean; speaking: boolean }>; myId: string; perms: Perms | null; onMute: (id: string, mute: boolean) => void; onKick: (id: string) => void; onInvite: () => void };
const HIDDEN = ["removed", "left"];

// Who is in the meeting (from the backend roster, with live mic / speaking state). Hosts can mute or
// remove people and invite more; everyone else just sees the list.
export function ParticipantsSheet({ visible, onClose, roster, live, myId, perms, onMute, onKick, onInvite }: Props) {
  const { t } = useT();
  const list = roster.filter((p) => !HIDDEN.includes(p.status));
  const stateOf = (st: string) => { const key = `admMeetB.p.${st}`; const v = t(key); return v === key ? st : v; };
  const kick = (p: Participant) => confirmDialog({ title: t("admMeetB.removeTitle"), message: p.name, confirmLabel: t("admMeetB.remove"), cancelLabel: t("adm.cancel"), icon: "user-x", danger: true, onConfirm: () => onKick(p.userId) });
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("admMeetB.people")} subtitle={`${list.length}`} snaps={[0.6, 0.92]}>
      <SheetScroll>
        {perms?.canInvite ? <Button title={t("admMeetB.invite")} icon="user-plus" variant="soft" full onPress={onInvite} /> : null}
        {list.map((p) => {
          const self = p.userId === myId;
          const lv = live.get(p.userId);
          const here = !!lv;
          const mic = lv ? lv.mic : p.mic;
          const act = !self && p.role !== "host";
          return (
            <RowCard key={p.userId} avatar={p.name || "?"} title={`${p.name || "—"}${self ? ` (${t("admMeetB.you")})` : ""}`} subtitle={p.role === "host" ? t("admMeetB.host") : here ? t("admMeetB.status.live") : stateOf(p.status)} tint={lv?.speaking ? "#22C55E" : undefined}
              right={<View style={s.acts}>
                {perms?.canMute && act ? <IconButton icon={mic ? "mic" : "mic-off"} size={36} onPress={() => onMute(p.userId, mic)} /> : <Text variant="caption" tone="gray">{mic ? "" : t("admMeetB.muted")}</Text>}
                {perms?.canKick && act ? <IconButton icon="user-x" size={36} onPress={() => kick(p)} /> : null}
              </View>} />
          );
        })}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ acts: { flexDirection: "row", alignItems: "center", gap: 6 } });
