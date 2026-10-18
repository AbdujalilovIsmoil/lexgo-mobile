import { useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ccKeys, useClientCard, useRecentClients } from "@/entities/admin-callcenter";
import { supKeys } from "@/entities/admin-support";
import { ClientCardView } from "@/widgets/cc-client";
import { AdminPage } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// /cc/clients/<id>: the operator's client card. `name` / `phone` params (from the search row) keep the header
// meaningful when the account may not read the full card.
export default function CcClientPage() {
  const { t } = useT();
  const insets = useInsets();
  const qc = useQueryClient();
  const { id, name, phone } = useLocalSearchParams<{ id: string; name?: string; phone?: string }>();
  const cid = String(id ?? "");
  const card = useClientCard(cid);
  const remember = useRecentClients((s) => s.add);
  const [pulled, setPulled] = useState(false);
  const c = card.data?.client;
  useEffect(() => {
    if (c?.id) void remember(c);
  }, [c, remember]);
  const refresh = async () => {
    setPulled(true);
    await Promise.all([qc.invalidateQueries({ queryKey: ccKeys.clients }), qc.invalidateQueries({ queryKey: supKeys.all }), qc.invalidateQueries({ queryKey: ccKeys.calls })]);
    setPulled(false);
  };
  return (
    <AdminPage title={c?.name || name || t("admCcB.cardTitle")} subtitle={c?.lexgoId}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={pulled} onRefresh={() => void refresh()} />}
      >
        <ClientCardView id={cid} hint={{ name: name ?? "", phone: phone ?? "" }} />
      </ScrollView>
    </AdminPage>
  );
}
