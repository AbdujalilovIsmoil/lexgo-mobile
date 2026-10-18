import { useCallback, useRef } from "react";
import { Track, type ConnectionQuality, type LocalVideoTrack, type Room } from "livekit-client";
import type { Quality } from "@/entities/call";
import { cameraOptions, encOf } from "../lib/roomOptions";
import type { Facing } from "./useLocalMedia";
import type { WantedCtl } from "./useWanted";

const RANK = ["audio_only", "low", "medium", "high"];

// The backend's adaptive quality ladder: on every connection-quality change of MY uplink the camera is
// moved to the matching rung (restartTrack keeps the one publication), or switched off on `lost`.
// Silent by contract (user_visible_quality_prompt is false). Nothing here may un-mute a person who muted.
export function useQualityLadder(room: Room | null, quality: Quality | null, wanted: WantedCtl, facing: Facing, paused: boolean) {
  const rung = useRef(quality?.startProfile ?? "low");
  return useCallback((q: ConnectionQuality) => {
    const lp = room?.localParticipant;
    const act = quality?.actions[q];
    if (!lp || !quality || !act || !quality.videoEnabled || quality.userPrompt || quality.mode !== "adaptive") return;
    const up = RANK.indexOf(act.profile) > RANK.indexOf(rung.current);
    if (up ? !quality.autoUpgrade : !quality.autoDowngrade) return;
    const prof = quality.profiles[act.profile];
    void (async () => {
      try {
        if (!act.cameraAllowed || act.profile === "audio_only" || !prof) {
          if (!quality.audioOnlyFallback || !lp.isCameraEnabled) return;
          rung.current = "audio_only";
          wanted.set({ autoOff: true });
          await lp.setCameraEnabled(false);
        } else if (!lp.isCameraEnabled) {
          if (!wanted.get().autoOff || !wanted.get().cam || paused) return;
          wanted.set({ autoOff: false });
          rung.current = act.profile;
          await lp.setCameraEnabled(true, cameraOptions(prof, facing), encOf(prof) ? { videoEncoding: encOf(prof) } : undefined);
        } else if (rung.current !== act.profile) {
          rung.current = act.profile;
          await (lp.getTrackPublication(Track.Source.Camera)?.track as LocalVideoTrack | undefined)?.restartTrack(cameraOptions(prof, facing));
        }
      } catch { /* a ladder step that fails is retried on the next quality event */ }
    })();
  }, [room, quality, wanted, facing, paused]);
}
