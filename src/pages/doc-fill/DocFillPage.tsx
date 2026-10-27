import { useMemo, useState } from "react";
import { draftKey, serviceSource, useDocSchema, useDraftsReady, useDraftStore, type DocSchema } from "@/entities/doc-form";
import { useDocSettings } from "@/entities/doc-settings";
import { useSession } from "@/entities/session";
import { FillFlow } from "@/features/doc-fill";
import { FlowFailure, FlowGate, FlowLoading, LoginGate } from "@/widgets/doc-flow";
import { useT } from "@/shared/i18n";

// Manual fill of a catalogue document (TZ 12): sign-in → schema → wizard. It is the document service's manual mode: closed
// (switched off, or not in the plan — TZ.md §4), the page says why instead.
export function DocFillPage({ id }: { id: string }) {
  const { t } = useT();
  const gate = useDocSettings().gate("manual");
  const user = useSession()?.user.id ?? "";
  const schema = useDocSchema(id);
  const ready = useDraftsReady();
  const title = schema.data?.title || t("dc2.title");
  if (gate.state !== "open") return <FlowGate title={title} gate={gate} />;
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
