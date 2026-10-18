import type { Room } from "livekit-client";
import type { Quality } from "@/entities/call";
import type { MediaAccess } from "./permissions";
import { cameraOptions, encOf, startProfile } from "./roomOptions";

export type PublishResult = { micFailed: boolean; camFailed: boolean };

// Publishes the mic (and camera on a video call) exactly once after connecting. Each is tried on its own,
// so a refused camera still leaves a working audio call. Failures are reported, never thrown.
export async function publishLocal(r: Room, q: Quality | null, video: boolean, access: MediaAccess): Promise<PublishResult> {
  const lp = r.localParticipant;
  let micFailed = !access.mic;
  let camFailed = video && !access.cam;
  if (access.mic) await lp.setMicrophoneEnabled(true).catch(() => { micFailed = true; });
  if (video && access.cam) {
    const prof = startProfile(q);
    const enc = encOf(prof);
    await lp.setCameraEnabled(true, cameraOptions(prof), enc ? { videoEncoding: enc } : undefined).catch(() => { camFailed = true; });
  }
  return { micFailed, camFailed };
}
