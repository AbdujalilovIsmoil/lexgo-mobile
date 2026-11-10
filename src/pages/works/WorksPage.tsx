import { useIsAuthed } from "@/entities/session";
import { ActiveRequestsList, HOME_BG } from "@/widgets/client-dash";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { WorksGuest } from "@/widgets/works";
import { useRaPage } from "@/shared/remote-assist";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// /works: every active request of the client. The backend closes GET /clients/me/works (client_works) to the client role, so the page
// reads the same two sources as Home's "Faol so'rovlar"; Home's "Barchasi", the profile, the menu and deep links all land here.
// Remote assistance: `client.my_works`.
export function WorksPage() {
  const { t } = useT();
  const { dark } = useTheme();
  const authed = useIsAuthed();
  const pad = useTabPad();
  useRaPage("client.my_works");
  return (
    <TabPage secondary ground={dark ? undefined : HOME_BG} title={t("cdash.home.active")}>
      {authed ? <ActiveRequestsList bottom={pad} /> : <WorksGuest />}
    </TabPage>
  );
}
