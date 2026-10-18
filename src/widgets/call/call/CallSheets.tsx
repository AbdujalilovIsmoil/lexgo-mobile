import { useMemo } from "react";
import type { useCallActions, useCallChat, useCallScreen } from "@/features/call/call";
import type { Recording, useTransfer } from "@/features/call";
import { useT } from "@/shared/i18n";
import { CallChatSheet } from "./CallChatSheet";
import type { StageMode } from "./CallStage";
import { EndMenu, MoreMenu } from "./CallMenus";
import { ExtendSheet } from "./ExtendSheet";
import { InviteSheet } from "./InviteSheet";
import { ParticipantsSheet } from "./ParticipantsSheet";
import { TransferSheet } from "./TransferSheet";
import type { Tile } from "./tiles";

export type SheetName = "" | "more" | "people" | "chat" | "invite" | "end" | "extend" | "transfer";
type Props = { s: ReturnType<typeof useCallScreen>; act: ReturnType<typeof useCallActions>; chat: ReturnType<typeof useCallChat>; rec: Recording; transfer: ReturnType<typeof useTransfer> | null; sheet: SheetName; open: (n: SheetName) => void; tiles: Tile[]; mode: StageMode; toggleMode: () => void };

// Every drawer of the call screen. Opening one closes the previous (the action list closes itself first).
export function CallSheets({ s, act, chat, rec, transfer, sheet, open, tiles, mode, toggleMode }: Props) {
  const { t } = useT();
  const close = () => open("");
  const live = useMemo(() => new Map(tiles.filter((x) => !x.share).map((x) => [x.id, { mic: x.mic, speaking: x.speaking }])), [tiles]);
  const roster = s.call?.participants ?? [];
  const nameOf = (id: string) => roster.find((p) => p.userId === id)?.name || t("admMeet.someone");
  const direct = (name: SheetName) => () => open(name); // the action list has already closed itself
  const chained = (name: SheetName) => () => { open(""); setTimeout(() => open(name), 350); }; // sheet → sheet: let the first one leave
  return (
    <>
      <MoreMenu visible={sheet === "more"} onClose={close} call={s.call} unread={chat.unread} video={s.videoAllowed} mode={mode} rec={rec} canTransfer={!!transfer} onChat={direct("chat")} onPeople={direct("people")} onMode={toggleMode} onPause={() => act.pause.mutate()} onFree={() => act.free.mutate()} onPaid={direct("extend")} onTransfer={direct("transfer")} />
      <EndMenu visible={sheet === "end"} onClose={close} canEnd={!!s.call?.perms.canEnd} onLeave={() => void act.leaveCall()} onEnd={() => void act.endAll()} />
      <ParticipantsSheet visible={sheet === "people"} onClose={close} roster={roster} live={live} myId={s.myId} perms={s.call?.perms ?? null} onMute={(id, mute) => act.mute.mutate({ id, mute })} onKick={(id) => act.kick.mutate(id)} onInvite={chained("invite")} />
      <InviteSheet visible={sheet === "invite"} onClose={close} me={s.myId} present={roster.filter((p) => p.status !== "removed").map((p) => p.userId)} onSend={(ids) => act.invite.mutate(ids)} />
      <CallChatSheet visible={sheet === "chat"} onClose={close} msgs={chat.msgs} nameOf={nameOf} onSend={(text) => chat.send(s.lk.room, text)} />
      <ExtendSheet visible={sheet === "extend"} onClose={close} price={s.call?.pricePerMin ?? 2000} busy={act.paid.isPending} onAsk={(m) => act.paid.mutate(m)} />
      {transfer ? <TransferSheet visible={sheet === "transfer"} onClose={close} me={s.myId} action={transfer} /> : null}
    </>
  );
}
