import { useLockStore } from "@/entities/session";
import { AskSheet } from "./AskSheet";
import { ConsentSheet } from "./ConsentSheet";
import { EndedNotice } from "./EndedNotice";
import { HighlightRing } from "./HighlightRing";
import { RaBanner } from "./RaBanner";

// Everything remote assistance draws, added to the top-most overlay host next to the toasts (shared/ui/overlay): above every sheet, the
// call screen and route transitions. Each part is empty while it has nothing to show. While the app lock is up nothing is asked or shown.
export function RaLayer() {
  const locked = useLockStore((s) => s.enabled && s.locked);
  if (locked) return null;
  return (
    <>
      <HighlightRing />
      <RaBanner />
      <EndedNotice />
      <ConsentSheet />
      <AskSheet />
    </>
  );
}
