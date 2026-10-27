import { randomUUID } from "expo-crypto";
import { registerSessionReset } from "@/shared/lib/sessionReset";

let id = "";

// The device session id of TZ RA §8: cryptographically random, made once per signed-in app run and held in memory only — never a
// hardware, advertising, install or push id. A sign-out forgets it; the backend revokes access when a session sees another one.
export const deviceSessionId = (): string => (id ||= `app-${randomUUID()}`);

registerSessionReset(() => {
  id = "";
});
