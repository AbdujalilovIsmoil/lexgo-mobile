import { useEffect } from "react";
import { Modal, Vibration } from "react-native";
import { usePathname } from "expo-router";
import { useIncomingCalls, useRingtone } from "@/features/call";
import { useKept } from "@/shared/lib/useKept";
import { OverlayHost } from "@/shared/ui";
import { IncomingCard } from "./IncomingCard";

// Mount ONCE, inside the app providers (MsgMounts): rings with a full-screen "X invites you to a meeting — Join /
// Decline" for a call or meeting invite (sound + vibration, stops by itself after 45 s). Quiet while a call is open.
export function IncomingCallWatcher() {
  const inCall = /^\/(manage\/)?call\//.test(usePathname());
  const { inc, accept, decline } = useIncomingCalls(inCall);
  const shown = useKept(inc);
  useRingtone(!!inc);
  useEffect(() => {
    if (!inc) return;
    Vibration.vibrate(500);
    const id = setInterval(() => Vibration.vibrate(500), 2400);
    return () => { clearInterval(id); Vibration.cancel(); };
  }, [inc]);
  return (
    <Modal visible={!!inc} transparent animationType="fade" onRequestClose={decline} statusBarTranslucent>
      {shown ? <IncomingCard inc={shown} onAccept={accept} onDecline={decline} /> : null}
      {inc ? <OverlayHost /> : null}
    </Modal>
  );
}
