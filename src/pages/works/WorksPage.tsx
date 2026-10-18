import { useState } from "react";
import { useWorks, useWorksRealtime, type Work } from "@/entities/work";
import { useIsAuthed } from "@/entities/session";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { WorkSheet, WorksGuest, WorksList } from "@/widgets/works";
import { useT } from "@/shared/i18n";

// "Ishlar" tab (TZ 15): every business process of the client from GET /clients/me/works —
// document requests to lawyers, urgent services, marketplace orders, cases and complaints. A tap opens the work in a
// bottom sheet (web modal); the full page is one more tap away.
export function WorksPage() {
  const { t } = useT();
  const authed = useIsAuthed();
  const works = useWorks();
  const pad = useTabPad();
  useWorksRealtime();
  const [picked, setPicked] = useState<Work | null>(null);
  return (
    <TabPage title={t("cl1.title")} subtitle={works.total ? t("cl1.count", { n: works.total }) : t("cl1.sub")}>
      {authed ? <WorksList lead works={works} onOpen={setPicked} bottom={pad} /> : <WorksGuest />}
      <WorkSheet work={picked} onClose={() => setPicked(null)} />
    </TabPage>
  );
}
