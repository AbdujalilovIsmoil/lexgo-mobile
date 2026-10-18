import { useEffect } from "react";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";

const SOUND = require("../../../../assets/sounds/ring.wav") as number;

/** Plays the ring in a loop while `on` (incoming call card: full volume; the caller's ringback: quieter).
 *  `inCall` = the LiveKit audio session is already running: expo-audio must not reset the device's audio mode then
 *  (allowsRecording:false switches iOS to playback-only, which silences the microphone for the rest of the call). */
export function useRingtone(on: boolean, volume = 1, inCall = false): void {
  const player = useAudioPlayer(SOUND);
  useEffect(() => {
    if (!on) return;
    // The player is an external native object configured outside React state.
    /* eslint-disable react-hooks/immutability */
    player.loop = true;
    player.volume = volume;
    /* eslint-enable react-hooks/immutability */
    if (!inCall) void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => undefined);
    void player.seekTo(0);
    player.play();
    return () => {
      try { player.pause(); } catch { /* the player is released together with the screen */ }
    };
  }, [on, volume, inCall, player]);
}
