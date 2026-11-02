import { useCallback, useEffect, useState } from "react";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";

export const MAX_VOICE_SEC = 300;

// A voice note describing the problem (m4a): the microphone is asked for only on the tap, recording stops by itself at five minutes,
// `onDone` gets the file and its length (not on cancel).
export function useVoiceNote(onDone: (v: { uri: string; name: string; durationMs: number }) => void) {
  const rec = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const st = useAudioRecorderState(rec, 250);
  const [denied, setDenied] = useState(false);
  const [starting, setStarting] = useState(false);

  const start = useCallback(async () => {
    if (starting || st.isRecording) return;
    setStarting(true);
    try {
      const perm = await requestRecordingPermissionsAsync();
      setDenied(!perm.granted);
      if (!perm.granted) return;
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await rec.prepareToRecordAsync();
      rec.record();
    } catch {
      // the recorder could not start: nothing is shown as recording
    } finally {
      setStarting(false);
    }
  }, [rec, starting, st.isRecording]);

  const finish = useCallback(async (keep: boolean) => {
    const ms = st.durationMillis;
    try {
      await rec.stop();
    } finally {
      await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    }
    if (keep && rec.uri && ms >= 1000) onDone({ uri: rec.uri, name: `voice-${Date.now()}.m4a`, durationMs: Math.round(ms) });
  }, [rec, onDone, st.durationMillis]);

  useEffect(() => {
    if (st.isRecording && st.durationMillis >= MAX_VOICE_SEC * 1000) void finish(true);
  }, [st.isRecording, st.durationMillis, finish]);

  return { recording: st.isRecording, seconds: Math.floor(st.durationMillis / 1000), starting, denied, start, stop: () => finish(true), cancel: () => finish(false) };
}
