import { useState } from "react";
import { View } from "react-native";
import { Segmented } from "@/shared/ui";
import { useAccess } from "@/entities/access";
import { useT } from "@/shared/i18n";
import { MeetingsBoard } from "./MeetingsBoard";
import { PlatformMeetings } from "./PlatformMeetings";

// Meetings screen body: my meetings, and — for superadmin / leads.manage — every meeting on the platform.
// Embeddable (the call-center "Uchrashuvlar" tab uses it); `bottom` keeps the last row clear of a tab bar.
export function MeetingsView({ bottom }: { bottom: number }) {
  const { t } = useT();
  const a = useAccess();
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const canAll = a.isSuper || a.can("leads.manage");
  return (
    <View style={{ flex: 1 }}>
      {canAll ? <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Segmented value={scope} onChange={setScope} options={[{ value: "mine", label: t("admMeet.history") }, { value: "all", label: t("admMeet.scopeAll") }]} /></View> : null}
      {scope === "mine" || !canAll ? <MeetingsBoard bottom={bottom} /> : <PlatformMeetings />}
    </View>
  );
}
