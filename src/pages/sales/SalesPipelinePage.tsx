import { LeadsScreen } from "@/widgets/admin-leads";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { useT } from "@/shared/i18n";

// The sales operator's landing tab, the web's "Sotuv voronkasi": the funnel with its stages, filters, new lead, the manage menu
// (add a stage, auto-assign), lead card with history — the same screen as the admin module, in a tab frame.
export function SalesPipelinePage() {
  const { t } = useT();
  const pad = useTabPad();
  return (
    <LeadsScreen
      bottomPad={pad}
      scrollHeader
      frame={({ children }) => (
        <TabPage title={t("admHub.mod.pipeline.title")} subtitle={t("admHub.mod.pipeline.desc")}>
          {children}
        </TabPage>
      )}
    />
  );
}

