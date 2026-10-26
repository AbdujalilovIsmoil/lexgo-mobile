import { registerSessionReset } from "@/shared/lib/sessionReset";
import { writeJson } from "@/shared/lib/storage";

// The chat list used to be copied to AsyncStorage as well; the SQLite snapshot (persistRules ["secure-chat", "rooms"], wiped with the
// session) now keeps it alone. The old copy is dropped at start and, should it come back, on sign-out.
const KEY = "msg_rooms_cache";
void writeJson(KEY, null);
registerSessionReset(() => void writeJson(KEY, null));
