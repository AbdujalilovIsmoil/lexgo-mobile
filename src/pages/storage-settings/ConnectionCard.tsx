import { useState } from "react";
import { Share, View } from "react-native";
import { useT } from "@/shared/i18n";
import { netLogText, recheckNetwork, useNetStore, useNetwork } from "@/shared/network";
import { useSocketState } from "@/shared/realtime";
import { Button, Text } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";

// Live view of the three links the app depends on: the device network, the API, the user socket. While offline it also says why
// (no network, or the phone does not let LexGo use it) with the OS's own words, and the connection journal can be shared for support.
export function ConnectionCard() {
  const { t } = useT();
  const net = useNetwork();
  const cause = useNetStore((s) => s.cause);
  const detail = useNetStore((s) => s.detail);
  const socket = useSocketState();
  const [busy, setBusy] = useState(false);
  const recheck = async () => {
    setBusy(true);
    await recheckNetwork();
    setTimeout(() => setBusy(false), 1500);
  };
  return (
    <SectionCard title={t("nt3.connTitle")}>
      <FactRows
        rows={[
          { label: t("nt3.conn.network"), value: net.online ? t(`nt3.conn.kind.${net.kind}`) : t(cause === "denied" ? "nt3.net.denied" : "nt3.conn.offline") },
          ...(cause ? [{ label: t("nt3.conn.cause"), value: t(`nt3.conn.why.${cause}`) }] : []),
          { label: t("nt3.conn.server"), value: net.serverDown ? t("nt3.conn.down") : net.slow ? t("nt3.conn.slow") : t("nt3.conn.ok") },
          { label: t("nt3.conn.socket"), value: t(`nt3.conn.sock.${socket}`) },
        ]}
      />
      {detail ? <Text variant="caption" tone="gray2" selectable>{`${t("nt3.conn.detail")}: ${detail}`}</Text> : null}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Button title={t("nt3.conn.recheck")} icon="refresh-cw" variant="line" size="sm" full loading={busy} onPress={() => void recheck()} /></View>
        <View style={{ flex: 1 }}><Button title={t("nt3.conn.share")} icon="share" variant="line" size="sm" full onPress={() => void Share.share({ message: netLogText() || "-" }).catch(() => undefined)} /></View>
      </View>
    </SectionCard>
  );
}
