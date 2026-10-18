import { useState } from "react";
import { draftKey, useDocSchema, useDraftsReady, useDraftStore } from "@/entities/doc-form";
import { useSession } from "@/entities/session";
import { AiFlow } from "@/features/doc-ai";
import { FlowFailure, FlowLoading, LoginGate } from "@/widgets/doc-flow";
import { EmptyState } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// AI-assisted document (TZ 13): sign-in → template check → need / questions / generate.
export function DocAiPage({ id }: { id: string }) {
  const { t } = useT();
  const user = useSession()?.user.id ?? "";
  const schema = useDocSchema(id);
  const ready = useDraftsReady();
  const title = schema.data?.title || t("dc5.title");
  if (!user) return <LoginGate title={title} />;
  if (schema.error) return <FlowFailure title={title} error={schema.error} onRetry={() => void schema.refetch()} />;
  if (!schema.data || !ready) return <FlowLoading title={title} />;
  if (!schema.data.aiFlow) return <AdminPage title={title}><EmptyState icon="zap-off" title={t("dc5.unavailable")} text={t("dc5.unavailableText")} /></AdminPage>;
  return <Restored id={id} user={user} title={title} />;
}

function Restored({ id, user, title }: { id: string; user: string; title: string }) {
  const [draft] = useState(() => useDraftStore.getState().drafts[draftKey(user, "ai", id)]);
  return <AiFlow serviceId={id} userId={user} title={title} draft={draft} />;
}
