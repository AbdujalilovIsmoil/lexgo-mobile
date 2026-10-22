import { useMemo, useState } from "react";
import { draftKey, serviceSource, useDocSchema, useDraftsReady, useDraftStore, type DocSchema } from "@/entities/doc-form";
import { useSession } from "@/entities/session";
import { FillFlow } from "@/features/doc-fill";
import { FlowFailure, FlowLoading, LoginGate } from "@/widgets/doc-flow";
import { useT } from "@/shared/i18n";

// Manual fill of a catalogue document (TZ 12): sign-in → schema → wizard.
export function DocFillPage({ id }: { id: string }) {
  const { t } = useT();
  const user = useSession()?.user.id ?? "";
  const schema = useDocSchema(id);
  const ready = useDraftsReady();
  const title = schema.data?.title || t("dc2.title");
  if (!user) return <LoginGate title={title} />;
  if (schema.error) return <FlowFailure title={title} error={schema.error} onRetry={() => void schema.refetch()} />;
  if (!schema.data || !ready) return <FlowLoading title={title} />;
  return <Restored id={id} user={user} schema={schema.data} />;
}

// Mounted once everything is loaded, so the draft is read exactly once.
function Restored({ id, user, schema }: { id: string; user: string; schema: DocSchema }) {
  const [draft] = useState(() => useDraftStore.getState().drafts[draftKey(user, "manual", id)]);
  const source = useMemo(() => serviceSource(id), [id]);
  return <FillFlow source={source} userId={user} schema={schema} draft={draft} />;
}
