import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { draftKey, useDraftStore, type Draft } from "@/entities/doc-form";
import { createRequest, useDoc, type MyDoc } from "@/entities/my-document";

type Args = { templateId: string; title: string; userId: string; explicit?: string; draft?: Draft; ready: boolean };

// A request that is not there any more (or not the person's): start a new one instead of failing.
const gone = (e: unknown): boolean => e instanceof ApiError && [403, 404, 410].includes(e.status);

// The document request behind a template's constructor (README §7.1–7.2): the one named by `?request=`, else the one stored in the draft, else a
// new one started with POST /document-requests (an empty questionnaire: the backend uses the template's fields). Started at most once; its id is
// written into the persisted draft at once, so leaving and coming back resumes the same request instead of starting another.
export function useTemplateRequest({ templateId, title, userId, explicit, draft, ready }: Args): { doc: MyDoc | undefined; error: unknown; retry: () => void } {
  const candidate = explicit || draft?.requestId || "";
  const existing = useDoc(candidate);
  const lost = !!candidate && existing.isError && gone(existing.error);
  const key = draftKey(userId, "tpl", templateId);
  const create = useMutation({
    mutationFn: () => createRequest({ templateId, title }),
    onSuccess: (d) => useDraftStore.getState().save(key, { answers: {}, step: 0, requestId: d.id }),
  });
  const started = useRef(false);
  useEffect(() => {
    if (!ready || started.current) return;
    if (!candidate || lost) {
      started.current = true;
      create.mutate();
    }
  }, [ready, candidate, lost, create]);
  const doc = lost || !candidate ? create.data : existing.data;
  // A request found by id that the draft does not know yet (an explicit `?request=`): the draft now follows it, its old answers belong to another one.
  const id = doc?.id ?? "";
  const known = draft?.requestId;
  useEffect(() => {
    if (id && known !== id && !create.data) useDraftStore.getState().save(key, { answers: {}, step: 0, requestId: id });
  }, [id, known, key, create.data]);
  const error = lost || !candidate ? create.error : existing.error;
  return { doc, error, retry: () => (lost || !candidate ? create.mutate() : void existing.refetch()) };
}
