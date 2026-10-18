import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ApiError } from "@/shared/api";
import { useClientCard, type CcClient } from "@/entities/admin-callcenter";
import { LogCallSheet } from "@/features/admin-callcenter";
import { BottomSheet, Button, SheetScroll, Text } from "@/shared/ui";
import { QueryBoundary } from "@/shared/ui/admin";
import { openTel } from "@/shared/lib/links";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { ClientCardBody } from "./ClientCardBody";

// Client 360 (orders, payments, leads, last actions) with call and "log a call" shortcuts.
// A role without lookup rights (403) still gets what the search result knew.
export function ClientSheet({ client: current, canLog, onClose }: { client: CcClient | null; canLog: boolean; onClose: () => void }) {
  const { t } = useT();
  const client = useKept(current);
  const q = useClientCard(client?.id ?? "");
  const [log, setLog] = useState(false);
  const denied = q.error instanceof ApiError && q.error.status === 403;
  return (
    <BottomSheet visible={!!current} onClose={onClose} title={client?.name || client?.phone || t("admCcB.cardTitle")} subtitle={[client?.lexgoId, client?.phone].filter(Boolean).join(" · ")} snaps={[0.76, 0.95]}>
      <SheetScroll>
        <View style={s.row}>
          {client?.phone ? <Button title={t("adm.call")} icon="phone" size="sm" variant="soft" onPress={() => openTel(client.phone)} /> : null}
          {canLog ? <Button title={t("admCcC.logCall")} icon="plus" size="sm" onPress={() => setLog(true)} /> : null}
        </View>
        {denied ? <Text variant="small" tone="gray">{t("admCcC.cardNoAccess")}</Text> : <QueryBoundary query={q}>{q.data ? <ClientCardBody card={q.data} /> : null}</QueryBoundary>}
      </SheetScroll>
      {client && canLog ? <LogCallSheet visible={log} onClose={() => setLog(false)} phone={client.phone} clientUserId={client.id} /> : null}
    </BottomSheet>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", gap: 8 } });
