import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { readJson, writeJson } from "@/shared/lib/storage";

const PREFIX = "pro-docs.started.";
const key = (id: string) => `${PREFIX}${id}`;
// Which records the user already opened is account data: wiped on logout / role change.
registerSessionReset(() => void AsyncStorage.getAllKeys().then((ks) => AsyncStorage.multiRemove(ks.filter((k) => k.startsWith(PREFIX)))).catch(() => {}));

// Has the advocate already answered "what do we start from?" for this record (kept across app restarts).
export function useStarted(id: string): { started: boolean | null; setStarted: (v: boolean) => void } {
  const [started, set] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    void readJson<boolean>(key(id)).then((v) => alive && set(v === true));
    return () => {
      alive = false;
    };
  }, [id]);
  return { started, setStarted: (v) => { set(v); void writeJson(key(id), v ? true : null); } };
}
