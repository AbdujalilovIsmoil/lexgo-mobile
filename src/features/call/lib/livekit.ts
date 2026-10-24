// The only place the native LiveKit / WebRTC packages are pulled in. It is reached from the call
// screen alone (the route imports it lazily), so the rest of the app never loads native WebRTC.
import { LogBox } from "react-native";
import { registerGlobals } from "@livekit/react-native";
import { LogLevel, setLogLevel } from "livekit-client";

registerGlobals();
// Quiet the Metro console: LiveKit's 5-second "webrtc stats" dump is info level, and react-native-webrtc prints every peer-connection step
// through its own nested copy of `debug`. Warnings and errors still come through.
setLogLevel(LogLevel.warn);
// eslint-disable-next-line @typescript-eslint/no-require-imports
try { (require("@livekit/react-native-webrtc/node_modules/debug") as { disable: () => string }).disable(); } catch { /* flat install: nothing to silence */ }
// LiveKit logs the first at error level when the phone camera reports no size yet; it falls back to 320x180 and the video works.
// The same for a data channel closing while the call is torn down or renegotiated; the app only sends on the reliable channel (call chat).
// And for the signal socket dropping (React Native reports the server closing it as a socket error): LiveKit reconnects by itself, and
// when the call is over — the other side declined or ended it, so the backend closed the room — the screen already shows that.
LogBox.ignoreLogs([/could not determine track dimensions/, /data channel '\w+' closed unexpectedly/, /error reading from signal stream/]);

export { AudioSession, VideoTrack } from "@livekit/react-native";
