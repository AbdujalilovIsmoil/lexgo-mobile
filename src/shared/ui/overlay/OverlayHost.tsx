import { useEffect, useState } from "react";
import { ConfirmDialog } from "../dialog/ConfirmDialog";
import { Toaster } from "../Toaster";
import { nextHostId, ROOT_HOST, topHost, useOverlayHosts } from "./hosts";
import { useOverlaySlots } from "./slots";

function Overlays() {
  const extra = useOverlaySlots((s) => s.list);
  return (
    <>
      <Toaster />
      <ConfirmDialog />
      {extra.map(({ key, C }) => <C key={key} />)}
    </>
  );
}

/**
 * Put inside a surface that covers the app (a native Modal, a transparent route): while it is the top-most open
 * surface the confirm dialog and the toasts are drawn inside it — above it on iOS and Android — instead of behind it.
 */
export function OverlayHost() {
  const [id] = useState(nextHostId);
  useEffect(() => {
    useOverlayHosts.getState().add(id);
    return () => useOverlayHosts.getState().remove(id);
  }, [id]);
  const top = useOverlayHosts((s) => topHost(s.stack));
  return top === id ? <Overlays /> : null;
}

/** The app-level overlays, drawn at the root only while no surface host is open. */
export function RootOverlays() {
  const top = useOverlayHosts((s) => topHost(s.stack));
  return top === ROOT_HOST ? <Overlays /> : null;
}
