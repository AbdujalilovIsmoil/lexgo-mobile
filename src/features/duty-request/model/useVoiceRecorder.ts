import { useCallback, useEffect, useState } from "react";
import { File } from "expo-file-system";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import type { Attach } from "@/entities/duty-request";

export const MAX_VOICE_SEC = 300;

// Voice note for the request (m4a). Starts only after the mic permission is granted;
// stops by itself at five minutes. `onDone` gets the finished file (not on cancel).
export function useVoiceRecorder(onDone: (a: Attach) => void) {
  const rec = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const st = useAudioRecorderState(rec, 250);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  // "starting" covers the permission prompt and the recorder warming up, so the recorder card is on screen from the tap.
  const [starting, setStarting] = useState(false);

  const start = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setStarting(true);
    try {
      const perm = await requestRecordingPermissionsAsync();
      setDenied(!perm.granted);
      if (!perm.granted) return;
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await rec.prepareToRecordAsync();
      rec.record();
    } catch {
      /* the recorder could not start: the card goes away and the tiles are back */
    } finally {
      setBusy(false);
      setStarting(false);
    }
  }, [rec, busy]);

  const finish = useCallback(
    async (keep: boolean) => {
      try {
        await rec.stop();
      } finally {
        await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
      }
      const uri = rec.uri;
      if (keep && uri) onDone({ uri, name: `voice-${Date.now()}.m4a`, mime: "audio/mp4", size: new File(uri).size });
    },
    [rec, onDone],
  );

  const seconds = Math.floor(st.durationMillis / 1000);
  useEffect(() => {
    if (st.isRecording && seconds >= MAX_VOICE_SEC) void finish(true);
  }, [st.isRecording, seconds, finish]);

  return { active: starting || st.isRecording, recording: st.isRecording, seconds, denied, busy, start, stop: () => finish(true), cancel: () => finish(false) };
}
