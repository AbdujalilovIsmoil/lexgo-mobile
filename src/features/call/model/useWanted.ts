import { useMemo, useRef } from "react";

export type Wanted = { cam: boolean; autoOff: boolean };
/** What the person chose (camera wanted / switched off by the quality ladder), shared with the ladder and the pause sync. */
export type WantedCtl = { get: () => Wanted; set: (p: Partial<Wanted>) => void };

// `cam` starts true: a video call publishes the camera on its own, and the ladder / pause sync may only bring back a camera they turned off themselves
// (they check autoOff / the camera's previous state first), so a camera nobody asked for never appears.
export function useWanted(): WantedCtl {
  const ref = useRef<Wanted>({ cam: true, autoOff: false });
  return useMemo<WantedCtl>(() => ({ get: () => ref.current, set: (p) => { ref.current = { ...ref.current, ...p }; } }), []);
}
