import { isVideoCodec, VideoPresets, type RoomOptions, type VideoCaptureOptions, type VideoEncoding, type VideoResolution } from "livekit-client";
import type { Profile, Quality } from "@/entities/call";

export const resOf = (p: Profile): VideoResolution => ({ width: p.width, height: p.height, frameRate: p.fps });
export const encOf = (p: Profile | undefined): VideoEncoding | undefined => (p && p.maxBitrate > 0 ? { maxBitrate: p.maxBitrate, maxFramerate: p.fps } : undefined);
/** The profile the call opens on ("low" on a video call). */
export const startProfile = (q: Quality | null): Profile | undefined => (q ? q.profiles[q.startProfile] ?? q.profiles.low : undefined);

/** Camera capture options for a rung of the quality ladder (front camera unless told otherwise). */
export const cameraOptions = (p: Profile | undefined, facing: "user" | "environment" = "user"): VideoCaptureOptions => ({
  facingMode: facing,
  resolution: p ? resOf(p) : VideoPresets.h360.resolution,
});

// Room options are frozen at construction, so the call's quality policy has to be in hand first.
export function buildRoomOptions(q: Quality | null): RoomOptions {
  const low = startProfile(q);
  return {
    adaptiveStream: q ? q.adaptiveStream : true,
    dynacast: q ? q.dynacast : true,
    stopLocalTrackOnUnpublish: q ? q.stopOnUnpublish : true,
    videoCaptureDefaults: cameraOptions(low),
    ...(q ? { audioCaptureDefaults: { ...q.capture } } : {}),
    publishDefaults: {
      simulcast: q ? q.publish.simulcast : true,
      dtx: q ? q.publish.dtx : true,
      red: q ? q.publish.red : true,
      backupCodec: q ? q.publish.backupCodec : true,
      ...(q && isVideoCodec(q.publish.videoCodec) ? { videoCodec: q.publish.videoCodec } : {}),
      ...(encOf(low) ? { videoEncoding: encOf(low) } : {}),
      ...(q && q.audioBitrate > 0 ? { audioPreset: { maxBitrate: q.audioBitrate } } : {}),
    },
  };
}
