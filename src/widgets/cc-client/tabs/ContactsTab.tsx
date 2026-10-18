import { useState } from "react";
import { View } from "react-native";
import { CallRow, useCalls, type CcClient } from "@/entities/admin-callcenter";
import { LogCallSheet } from "@/features/admin-callcenter";
import { Button, ErrorView, Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { MoreRows } from "../MoreRows";

// Contact history with this client: logged calls and notes, plus a button to log a new one.
export function ContactsTab({ client }: { client: Pick<CcClient, "id" | "phone"> }) {
  const { t } = useT();
  const [form, setForm] = useState(false);
  const q = useCalls(client.id);
  return (
    <View style={{ gap: 10 }}>
      <Button title={t("admCcC.logCall")} icon="plus" size="sm" variant="soft" onPress={() => setForm(true)} />
      {q.isLoading ? <Skeleton height={72} round={20} /> : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} compact /> : <MoreRows items={q.data ?? []} empty={t("cc2.none.contacts")} render={(c) => <CallRow key={c.id} call={c} />} />}
      <LogCallSheet visible={form} onClose={() => setForm(false)} phone={client.phone} clientUserId={client.id} />
    </View>
  );
}
