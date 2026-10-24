import { useEffect, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import type { useCallActions, useCallChat, useCallScreen } from "@/features/call/call";
import { useRingtone, type Recording, type useTransfer } from "@/features/call";
import { useT } from "@/shared/i18n";
import { toast, FocusStatusBar } from "@/shared/ui";
import { CallBanners } from "./CallBanners";
import { CallControls } from "./CallControls";
import { CallHeader } from "./CallHeader";
import { CallSheets, type SheetName } from "./CallSheets";
import { CallStage, type StageMode } from "./CallStage";
import { ExtensionBar } from "./ExtensionBar";
import { RecordingBar } from "./RecordingBar";
import { buildTiles } from "./tiles";

type Props = { s: ReturnType<typeof useCallScreen>; act: ReturnType<typeof useCallActions>; chat: ReturnType<typeof useCallChat>; rec: Recording; transfer: ReturnType<typeof useTransfer> | null; captured?: boolean };

// The live call: video tiles, header, banners, controls and the drawers they open. The screen stays awake, and the
// caller hears a quiet ringback until somebody joins.
export function LiveCall({ s, act, chat, rec, transfer, captured = false }: Props) {
  const { t } = useT();
  useKeepAwake();
  const [mode, setMode] = useState<StageMode>("grid");
  const [pinned, setPinned] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetName>("");
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => { setSheet("end"); return true; });
    return () => sub.remove();
  }, []);
  const setChatOpen = chat.setOpen;
  useEffect(() => setChatOpen(sheet === "chat"), [sheet, setChatOpen]);
  useRingtone(s.call?.callerId === s.myId && s.lk.status === "ringing" && !s.ended, 0.3, true);
  const tiles = buildTiles(s.lk.room, s.call?.participants ?? [], t("admMeet.someone"));
  const lp = s.lk.room?.localParticipant;
  const mic = !!lp?.isMicrophoneEnabled;
  const cam = !!lp?.isCameraEnabled;
  const upgrade = !s.videoAllowed && s.lk.status !== "connecting";
  const toggleMode = () => { setMode((m) => (m === "grid" ? "speaker" : "grid")); setPinned(null); };
  const labels = { mic: t("admMeetB.mic"), cam: t("admMeet.camera"), flip: t("admMeetB.flip"), speaker: t("admMeetB.speaker"), more: t("admMeetB.more"), end: t("admMeet.end") };
  return (
    <View style={st.fill}>
      <FocusStatusBar style="light" />
      <CallHeader rec={rec.state === "recording"} title={s.call?.title ?? ""} status={s.lk.status} elapsed={s.clock.elapsed} left={s.clock.left} paused={s.clock.paused} count={tiles.filter((x) => !x.share).length} mode={mode} video={s.videoAllowed} onMode={toggleMode} onPeople={() => setSheet("people")} />
      <CallBanners denied={{ mic: s.lk.denied.mic && !mic, cam: s.lk.denied.cam && !cam }} alone={s.alone} onStay={s.stay} onLeave={() => void act.leaveCall()} paused={s.clock.paused} reconnecting={s.lk.status === "reconnecting"} failed={s.lk.status === "error"} onRetry={s.creds.retry} />
      <ExtensionBar pending={s.call?.pending ?? null} host={!!s.call?.perms.canEnd} />
      <RecordingBar rec={rec} />
      <View style={st.stage}><CallStage tiles={tiles} mode={mode} pinned={pinned} onPin={(id) => { setPinned(id); if (id) setMode("speaker"); }} mirror={s.media.facing === "user"} waiting={t("admMeetB.waiting")} /></View>
      <CallControls mic={mic} cam={cam} showCam={s.videoAllowed || upgrade} camLabel={upgrade ? t("admMeetB.toVideo") : t("admMeet.camera")} showFlip={s.videoAllowed && cam} speaker={s.media.speaker} unread={chat.unread} busy={s.media.busy} locked={s.locked} labels={labels}
        onMic={() => (captured && !mic ? toast(t("admMeet.guardMicLocked"), "info") : s.locked && !mic ? toast(t("admMeetB.mutedByHost"), "info") : void s.media.toggleMic())} onCam={() => void s.media.toggleCam()} onFlip={() => void s.media.flip()} onSpeaker={s.media.toggleSpeaker} onMore={() => setSheet("more")} onEnd={() => setSheet("end")} />
      <CallSheets s={s} act={act} chat={chat} rec={rec} transfer={transfer} sheet={sheet} open={setSheet} tiles={tiles} mode={mode} toggleMode={toggleMode} />
    </View>
  );
}

const st = StyleSheet.create({ fill: { flex: 1, backgroundColor: "#03102B" }, stage: { flex: 1, paddingHorizontal: 10, paddingVertical: 6 } });
