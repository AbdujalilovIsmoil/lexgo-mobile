import { useEffect, useRef, useState } from "react";
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { File, Paths } from "expo-file-system";
import type { PickedFile } from "@/entities/secure-chat";

// "starting" is the moment between the tap and the first recorded second (permission, recorder warming up): the bar is already on screen.
export type VoicePhase = "idle" | "starting" | "recording" | "preview";
export type VoiceStart = "ok" | "denied" | "failed";
const MIN_MS = 800;
const MAX_MS = 5 * 60_000;

// Voice message: record (expo-audio, AAC .m4a) → stop → preview → send as an upload of type "voice".
export function useVoiceRecorder() {
  const rec = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const st = useAudioRecorderState(rec, 200);
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [clip, setClip] = useState<(PickedFile & { ms: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stopRef = useRef<() => Promise<unknown>>(async () => undefined);
  const gone = useRef(false); // cancelled while still starting

  const release = () => void setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
  const start = async (): Promise<VoiceStart> => {
    gone.current = false;
    setPhase("starting");
    try {
      if (!(await AudioModule.requestRecordingPermissionsAsync()).granted) { setPhase("idle"); return "denied"; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await rec.prepareToRecordAsync();
      if (gone.current) { release(); return "ok"; }
      rec.record();
      timer.current = setTimeout(() => void stopRef.current(), MAX_MS);
      setPhase("recording");
      return "ok";
    } catch {
      release();
      setPhase("idle");
      return "failed";
    }
  };
  const stop = async (): Promise<"ok" | "short" | "failed"> => {
    clearTimeout(timer.current);
    const ms = st.durationMillis;
    try {
      await rec.stop();
      release();
      if (!rec.uri || ms < MIN_MS) { setPhase("idle"); return "short"; }
      const target = new File(Paths.cache, `voice-${Date.now()}.m4a`);
      new File(rec.uri).copy(target);
      setClip({ uri: target.uri, name: target.name, mime: "audio/mp4", size: target.size ?? 0, ms });
      setPhase("preview");
      return "ok";
    } catch {
      setPhase("idle");
      return "failed";
    }
  };
  useEffect(() => { stopRef.current = stop; });
  const cancel = () => {
    gone.current = true;
    clearTimeout(timer.current);
    if (rec.isRecording) void rec.stop().catch(() => undefined);
    release();
    setClip(null);
    setPhase("idle");
  };
  useEffect(() => () => {
    clearTimeout(timer.current);
    try { if (rec.isRecording) void rec.stop().catch(() => undefined); } catch { /* released with the screen */ }
  }, [rec]);
  return { phase, ms: st.durationMillis, clip, start, stop, cancel, done: () => { setClip(null); setPhase("idle"); } };
}
