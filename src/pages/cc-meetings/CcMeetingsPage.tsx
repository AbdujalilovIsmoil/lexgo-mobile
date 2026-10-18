import { CcToolsButton } from "@/widgets/cc-tools";
import { MeetingsView } from "@/widgets/meetings";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { useT } from "@/shared/i18n";

// Uchrashuvlar tab: the shared meetings screen (upcoming / past, join, create when allowed; staff also see the
// platform history) embedded under the call-center tab frame.
export function CcMeetingsPage() {
  const { t } = useT();
  return (
    <TabPage title={t("tabs.meetings")} subtitle={t("cc1.meetings.sub")} right={<CcToolsButton />}>
      <MeetingsView bottom={useTabPad()} />
    </TabPage>
  );
}
