import { lazy, Suspense } from "react";
import { View } from "react-native";

// The call screen pulls in native LiveKit / WebRTC, so it is loaded only when this route is opened.
const CallPage = lazy(() => import("@/pages/call/CallPage"));

// /call/<roomId>?callId=<id> — full-screen in-app call (any signed-in user may join a call they were invited to).
export default function Screen() {
  return (
    <Suspense fallback={<View style={{ flex: 1, backgroundColor: "#03102B" }} />}>
      <CallPage />
    </Suspense>
  );
}
