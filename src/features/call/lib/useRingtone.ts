import { useEffect } from "react";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

const SOUND = require("../../../../assets/sounds/ring.wav") as number;

/** Plays the ring in a loop while `on` (incoming call card: full volume; the caller's ringback: quieter).
 *  The player exists only while it rings: the incoming-call watcher is mounted for the whole session, and an idle expo-audio player
 *  still wakes Android's main thread twice a second.
 *  `inCall` = the LiveKit audio session is already running: expo-audio must not reset the device's audio mode then
 *  (allowsRecording:false switches iOS to playback-only, which silences the microphone for the rest of the call). */
export function useRingtone(on: boolean, volume = 1, inCall = false): void {
  useEffect(() => {
    if (!on) return;
    const player = createAudioPlayer(SOUND);
    player.loop = true;
    player.volume = volume;
    if (!inCall) void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => undefined);
    player.play();
    return () => {
      try {
        player.pause();
        player.release();
      } catch {
        /* already released */
      }
    };
  }, [on, volume, inCall]);
}
