export type CallType = "audio" | "video";
export type Profile = { width: number; height: number; fps: number; maxBitrate: number };
export type QualityAction = { profile: string; cameraAllowed: boolean };

// quality_policy: how the Room is built and how the picture climbs / drops with the link.
export type Quality = {
  mode: string;
  videoEnabled: boolean;
  startProfile: string;
  autoUpgrade: boolean;
  autoDowngrade: boolean;
  audioOnlyFallback: boolean;
  userPrompt: boolean;
  adaptiveStream: boolean;
  dynacast: boolean;
  stopOnUnpublish: boolean;
  capture: { echoCancellation: boolean; noiseSuppression: boolean; autoGainControl: boolean };
  publish: { simulcast: boolean; videoCodec: string; backupCodec: boolean; dtx: boolean; red: boolean };
  profiles: Record<string, Profile>;
  audioBitrate: number;
  screen: { fps: number; maxBitrate: number } | null;
  actions: Record<string, QualityAction>;
};

export type Perms = { canInvite: boolean; canMute: boolean; canKick: boolean; canEnd: boolean };
export type Participant = { userId: string; name: string; role: string; status: string; mic: boolean; camera: boolean; screen: boolean };
export type RecState = "off" | "requested" | "allowed" | "denied" | "recording";
export type Recording = { state: RecState; requestedBy: string; allowedBy: string; startedBy: string };
export type Usage = { used: number; limit: number; remaining: number };
export type Extension = { id: string; minutes: number; amount: number; status: string; expiresAt: string };

export type Call = {
  id: string;
  workId: string;
  roomId: string;
  callerId: string;
  type: CallType;
  title: string;
  status: string; // active | scheduled | ended | cancelled | expired
  startedAt: string;
  endedAt: string;
  autoEndAt: string;
  remaining: number; // seconds
  maxMinutes: number;
  participants: Participant[];
  perms: Perms;
  paused: boolean;
  pausedLeft: number;
  pauseExpiresAt: string;
  freeAvailable: boolean;
  freeMax: number;
  pricePerMin: number;
  pending: Extension | null;
  recording: Recording;
  docRequestId: string;
  docRecordId: string;
  usage: Usage | null; // the client's audio-call allowance on a document request
  participantCount: number;
  canStartNow: boolean;
  quality: Quality | null;
  livekitUrl: string;
  livekitToken: string;
};

export const LIVE_STATUSES = ["active", "scheduled"];
export const isLive = (callStatus: string) => LIVE_STATUSES.includes(callStatus);
