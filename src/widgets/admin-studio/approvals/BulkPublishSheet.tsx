import { useState } from "react";
import { View } from "react-native";
import { FormSheet } from "@/shared/ui/admin";
import { Icon, Input, Text } from "@/shared/ui";
import { bulkPublish, studioKeys, type BulkResult } from "@/entities/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { ids: string[]; titles: Record<string, string>; visible: boolean; onClose: () => void; onDone: () => void };

// Publish the selected approved objects in one go. Each one succeeds or fails on its own: the result lists what went through and, for
// every failure, the server's reason.
export function BulkPublishSheet({ ids, titles, visible, onClose, onDone }: Props) {
  const { t } = useT();
  const c = useColors();
  const [note, setNote] = useState("");
  const [result, setResult] = useState<BulkResult | null>(null);
  const m = useAdminMutation({ mutationFn: () => bulkPublish(ids, note.trim()), invalidate: [studioKeys.all], onSuccess: setResult });
  const close = () => { const had = !!result; setResult(null); setNote(""); onClose(); if (had) onDone(); };
  return (
    <FormSheet
      visible={visible} onClose={close} title={t(result ? "admStudioD.approvals.resultTitle" : "admStudioD.approvals.publishTitle")}
      onSubmit={result ? close : () => m.mutate()} submitLabel={t(result ? "admStudioD.approvals.close" : "admStudioD.approvals.publish")} submitting={m.isPending} disabled={!ids.length}
    >
      {result ? (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Icon name="check-circle" size={18} color={c.ok} /><Text variant="body" weight="bold">{t("admStudioD.approvals.publishedN", { n: result.published.length })}</Text></View>
          {result.failed.length ? <Text variant="body" weight="bold" style={{ color: c.err }}>{t("admStudioD.approvals.failedN", { n: result.failed.length })}</Text> : null}
          {result.failed.map((f) => (
            <View key={f.id} style={{ gap: 2, padding: 12, borderRadius: 14, backgroundColor: c.errBg }}>
              <Text variant="small" weight="bold" numberOfLines={2}>{titles[f.id] || f.id}</Text>
              <Text variant="caption" tone="gray">{f.message}</Text>
            </View>
          ))}
        </View>
      ) : (
        <>
          <Text variant="small" tone="gray">{t("admStudioD.approvals.publishText", { n: ids.length })}</Text>
          <Input value={note} onChangeText={setNote} placeholder={t("admStudioD.approvals.notePh")} multiline maxLength={2000} />
        </>
      )}
    </FormSheet>
  );
}
