import { useState } from "react";
import { Track, type LocalVideoTrack, type Room } from "livekit-client";
import { patchParticipant, type Call } from "@/entities/call";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { setSpeaker } from "../lib/audioRoute";
import { askMediaAccess, isDenied } from "../lib/permissions";
import { cameraOptions, encOf, startProfile } from "../lib/roomOptions";
import { useWanted } from "./useWanted";

export type Facing = "user" | "environment";
type Ids = { roomId: string; callId: string; myId: string };

// Microphone, camera, lens flip and loudspeaker. `wanted` remembers what the person chose, so the
// quality ladder only ever brings back a camera it switched off itself.
export function useLocalMedia(room: Room | null, call: Call | null, ids: Ids, onUpgrade: () => void) {
  const { t } = useT();
  const [facing, setFacing] = useState<Facing>("user");
  const [speaker, setSpeakerOn] = useState(true);
  const [busy, setBusy] = useState(false);
  const wanted = useWanted();
  const sync = (patch: { mic_enabled?: boolean; camera_enabled?: boolean }) => {
    patchParticipant(ids.roomId, ids.callId, ids.myId, patch).then((c) => { if (c.type === "video" || c.quality?.videoEnabled) onUpgrade(); }).catch(() => undefined);
  };
  const toggleMic = async () => {
    const lp = room?.localParticipant;
    if (!lp) return;
    const on = !lp.isMicrophoneEnabled;
    try { await lp.setMicrophoneEnabled(on); sync({ mic_enabled: on }); } catch (e) { toast(isDenied(e) ? t("admMeet.micDenied") : t("admMeet.micFailed"), "err"); }
  };
  const toggleCam = async () => {
    const lp = room?.localParticipant;
    if (!lp || busy) return;
    const on = !lp.isCameraEnabled;
    setBusy(true);
    wanted.set({ cam: on, autoOff: false });
    try {
      if (on && !(await askMediaAccess(true)).cam) throw new Error("denied");
      const prof = startProfile(call?.quality ?? null);
      const enc = encOf(prof);
      await lp.setCameraEnabled(on, on ? cameraOptions(prof, facing) : undefined, on && enc ? { videoEncoding: enc } : undefined);
      sync({ camera_enabled: on });
    } catch (e) {
      wanted.set({ cam: false });
      toast(isDenied(e) || (e as Error)?.message === "denied" ? t("admMeet.camDenied") : t("admMeet.camFailed"), "err");
    }
    setBusy(false);
  };
  const flip = async () => {
    const track = room?.localParticipant.getTrackPublication(Track.Source.Camera)?.track as LocalVideoTrack | undefined;
    if (!track || busy) return;
    const next: Facing = facing === "user" ? "environment" : "user";
    setBusy(true);
    try {
      await track.restartTrack(cameraOptions(startProfile(call?.quality ?? null), next));
      setFacing(next);
    } catch {
      try { (track.mediaStreamTrack as unknown as { _switchCamera: () => void })._switchCamera(); setFacing(next); } catch { toast(t("admMeet.camFailed"), "err"); }
    }
    setBusy(false);
  };
  const toggleSpeaker = () => {
    const next = !speaker;
    setSpeakerOn(next);
    setSpeaker(next).catch(() => setSpeakerOn(!next));
  };
  return { facing, speaker, busy, wanted, toggleMic, toggleCam, flip, toggleSpeaker };
}
