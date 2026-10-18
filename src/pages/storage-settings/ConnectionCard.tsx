import { useT } from "@/shared/i18n";
import { useNetwork } from "@/shared/network";
import { useSocketState } from "@/shared/realtime";
import { FactRows, SectionCard } from "@/shared/ui/admin";

// Live view of the three links the app depends on: the device network, the API, the user socket.
export function ConnectionCard() {
  const { t } = useT();
  const net = useNetwork();
  const socket = useSocketState();
  return (
    <SectionCard title={t("nt3.connTitle")}>
      <FactRows
        rows={[
          { label: t("nt3.conn.network"), value: net.online ? t(`nt3.conn.kind.${net.kind}`) : t("nt3.conn.offline") },
          { label: t("nt3.conn.server"), value: net.serverDown ? t("nt3.conn.down") : net.slow ? t("nt3.conn.slow") : t("nt3.conn.ok") },
          { label: t("nt3.conn.socket"), value: t(`nt3.conn.sock.${socket}`) },
        ]}
      />
    </SectionCard>
  );
}
