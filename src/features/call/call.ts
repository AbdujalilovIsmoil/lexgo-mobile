// The part of the meetings feature that needs native WebRTC. Import it from the call screen's widgets only.
import "./lib/livekit"; // registers the LiveKit / WebRTC globals before any other call module runs
export { useCallScreen } from "./model/useCallScreen";
export { useCallChat, type ChatMsg } from "./model/useCallChat";
export { useCallActions } from "./model/useCallActions";
export { VideoTrack } from "./lib/livekit";
export type { RoomStatus } from "./model/useLiveKitRoom";
export { useUnansweredHangUp } from "./model/useUnansweredHangUp";
export { shouldHangUp, type Phase } from "./lib/callPhase";
