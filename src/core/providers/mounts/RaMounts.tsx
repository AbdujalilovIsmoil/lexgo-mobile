import { useEffect } from "react";
import { useSession } from "@/entities/session";
import { addOverlay } from "@/shared/ui/overlay";
import { RaHost, RaLayer } from "@/widgets/remote-assist";

function ClientRa() {
  useEffect(() => addOverlay("remote-assist", RaLayer), []);
  return <RaHost />;
}

// App-level mount point of remote assistance (TZ.md Remote Assistance contract): only a signed-in client can be helped, so a visitor,
// an advokat or a yurist mounts nothing. The layer (banner, consent, confirmations, outline) is drawn with the toasts in the top-most
// overlay host, so it stays above sheets, the call screen and route transitions.
export function RaMounts() {
  return useSession()?.user.role === "client" ? <ClientRa /> : null;
}
