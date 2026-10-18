import { useState } from "react";
import { View } from "react-native";
import { Avatar, Button, EmptyState, Input, Pill, Skeleton, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { addComment, studioKeys, useComments, useStudioText } from "@/entities/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { fmtDateTime } from "@/shared/lib/format";

type Props = { id: string; canWrite: boolean; versionLabel?: (versionId: string) => string };

// Comments of an object (newest first) with a box to add one. Also used inside the approval sheet.
export function CommentsPane({ id, canWrite, versionLabel }: Props) {
  const { t, locale, role } = useStudioText();
  const q = useComments(id);
  const [text, setText] = useState("");
  const send = useAdminMutation({ mutationFn: (v: string) => addComment(id, v), invalidate: [[...studioKeys.all, "comments", id]], onSuccess: () => setText("") });
  const list = [...(q.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <View style={{ gap: 10 }}>
      {canWrite ? (
        <View style={{ gap: 8 }}>
          <Input value={text} onChangeText={setText} placeholder={t("admStudioB.comments.placeholder")} multiline maxLength={2000} style={{ minHeight: 70, textAlignVertical: "top" }} />
          <Button title={t("admStudioB.comments.send")} icon="send" size="sm" disabled={!text.trim()} loading={send.isPending} onPress={() => send.mutate(text.trim())} />
        </View>
      ) : null}
      {q.isLoading ? <Skeleton height={64} round={16} /> : null}
      {q.data && !list.length ? <EmptyState compact icon="message-circle" title={t("admStudioB.comments.empty")} /> : null}
      {list.map((c, i) => (
        <SectionCard key={c.id || i}>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <Avatar name={c.author || "?"} size={32} />
            <View style={{ flex: 1 }}>
              <Text variant="small" weight="bold">{c.author || t("admStudioB.comments.someone")}</Text>
              <Text variant="caption" tone="gray">{fmtDateTime(c.createdAt, locale)}</Text>
            </View>
            {c.authorRole ? <Pill label={role(c.authorRole)} tone="gray" small /> : null}
            {c.versionId && versionLabel?.(c.versionId) ? <Pill label={`v${versionLabel(c.versionId)}`} tone="gray" small /> : null}
          </View>
          <Text variant="small" selectable>{c.text}</Text>
        </SectionCard>
      ))}
    </View>
  );
}
