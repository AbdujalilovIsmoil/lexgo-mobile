import { MeetingsView } from "@/widgets/meetings";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { useT } from "@/shared/i18n";

// The web's "Uchrashuvlar" for a sales operator: running meetings, creating one when allowed, and the history — mine or all.
export function SalesMeetingsPage() {
  const { t } = useT();
  return (
    <TabPage title={t("admHub.mod.meetings.title")} subtitle={t("admHub.mod.meetings.desc")}>
      <MeetingsView bottom={useTabPad()} />
    </TabPage>
  );
}
