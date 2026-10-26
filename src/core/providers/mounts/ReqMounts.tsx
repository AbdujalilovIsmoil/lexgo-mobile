import { useAccess } from "@/entities/access";
import { useRequestCounts } from "@/entities/pro-requests";
import { useIsAuthed } from "@/entities/session";

function LiveCounts() {
  useRequestCounts(true);
  return null;
}

// App-level mount point of the requests package: a yurist's / advokat's "So'rovlar" badge is counted (and kept live) here, not on the
// tab page — tab pages mount on their first visit, and the badge must be right before that.
export function ReqMounts() {
  const authed = useIsAuthed();
  const { seller } = useAccess();
  return authed && seller ? <LiveCounts /> : null;
}
