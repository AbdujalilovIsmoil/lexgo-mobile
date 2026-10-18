import { useState } from "react";
import { ActivityList } from "./ActivityList";
import { EventsList } from "./EventsList";
import type { HistoryKind } from "./KindBar";

// "Journal" tab: the account's audit log, or its security events.
export function HistoryTab() {
  const [kind, setKind] = useState<HistoryKind>("activity");
  return kind === "activity" ? <ActivityList onKind={setKind} /> : <EventsList onKind={setKind} />;
}
