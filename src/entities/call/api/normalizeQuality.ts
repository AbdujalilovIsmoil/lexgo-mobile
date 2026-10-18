import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { Profile, Quality, QualityAction } from "../model/types";

const profile = (v: unknown): Profile => {
  const d = asDict(v);
  return { width: asNum(d.width), height: asNum(d.height), fps: asNum(d.fps), maxBitrate: asNum(d.max_bitrate) };
};

// quality_policy of a call; every flag defaults to the documented behaviour when the backend omits it.
export function normQuality(v: unknown): Quality | null {
  if (!v || typeof v !== "object") return null;
  const d = asDict(v);
  const room = asDict(d.recommended_room_options);
  const cap = asDict(d.audio_capture_defaults);
  const pub = asDict(d.publish_defaults);
  const pr = asDict(d.profiles);
  const ss = pr.screen_share ? asDict(pr.screen_share) : null;
  const profiles: Record<string, Profile> = {};
  for (const k of ["low", "medium", "high"]) if (pr[k]) profiles[k] = profile(pr[k]);
  const actions: Record<string, QualityAction> = {};
  for (const [k, raw] of Object.entries(asDict(d.connection_quality_actions))) {
    const a = asDict(raw);
    actions[k] = { profile: asStr(a.profile), cameraAllowed: a.camera_allowed === true };
  }
  return {
    mode: asStr(d.mode, "adaptive"),
    videoEnabled: d.video_enabled !== false,
    startProfile: asStr(d.start_profile, "low"),
    autoUpgrade: d.auto_upgrade !== false,
    autoDowngrade: d.auto_downgrade !== false,
    audioOnlyFallback: d.audio_only_fallback !== false,
    userPrompt: d.user_visible_quality_prompt === true,
    adaptiveStream: room.adaptiveStream !== false,
    dynacast: room.dynacast !== false,
    stopOnUnpublish: room.stopLocalTrackOnUnpublish !== false,
    capture: { echoCancellation: cap.echoCancellation !== false, noiseSuppression: cap.noiseSuppression !== false, autoGainControl: cap.autoGainControl !== false },
    publish: { simulcast: pub.simulcast !== false, videoCodec: asStr(pub.videoCodec, "vp8"), backupCodec: pub.backupCodec !== false, dtx: pub.dtx !== false, red: pub.red !== false },
    profiles,
    audioBitrate: asNum(asDict(pr.audio_only).audio_bitrate, 24000),
    screen: ss ? { fps: asNum(ss.fps, 5), maxBitrate: asNum(ss.max_bitrate, 500000) } : null,
    actions,
  };
}
