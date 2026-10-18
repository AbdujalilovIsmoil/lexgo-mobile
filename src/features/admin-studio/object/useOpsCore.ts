import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { createObject, getObject, isBlank, saveObject, studioError, studioKeys, useStudioErrorText } from "@/entities/admin-studio";
import { toast } from "@/shared/ui";
import { successHaptic } from "@/shared/lib/haptics";
import { normErrors } from "./errors";
import type { Busy, OpsCtx, SaveMeta } from "./opsTypes";

// Shared machinery of the editor's writes: busy flag, error routing, persist (create/save), post-write refresh.
export function useOpsCore(c: OpsCtx) {
  const router = useRouter();
  const qc = useQueryClient();
  const errText = useStudioErrorText();
  const [busy, setBusy] = useState<Busy>("");
  const [error, setError] = useState("");
  const key = (id: string) => [...studioKeys.all, "object", id];

  const refresh = async (id: string) => {
    const d = await getObject(id);
    qc.setQueryData(key(id), d);
    return d;
  };
  // Field errors go onto the form, anything else becomes `error` text.
  const fail = (e: unknown) => {
    const se = studioError(e);
    if (Object.keys(se.fieldErrors).length) c.setErrors(normErrors(se.fieldErrors));
    setError(Object.keys(se.fieldErrors).length ? "" : errText(e));
    return false;
  };
  const run = async (b: Busy, fn: () => Promise<boolean | void>): Promise<boolean> => {
    setBusy(b);
    setError("");
    try {
      return (await fn()) !== false;
    } catch (e) {
      return fail(e);
    } finally {
      setBusy("");
    }
  };
  const persist = async (meta: SaveMeta = {}): Promise<string> => {
    if (!c.draft) return "";
    const title = c.draft.title.trim();
    if (!title) {
      c.setErrors({ title: "@required" });
      return "";
    }
    // The object title doubles as the payload `title` the schema asks for, when that is left empty.
    const payload = c.ctor?.fields.some((f) => f.key === "title") && isBlank(c.draft.payload.title) ? { ...c.draft.payload, title } : c.draft.payload;
    if (c.id) return (await saveObject(c.id, { title, payload, ...meta }), c.id);
    const made = await createObject(c.code, title, payload, c.target);
    qc.setQueryData(key(made.id), made);
    return made.id;
  };
  const open = (id: string) => (c.release(), router.replace({ pathname: "/manage/studio/object", params: { id } } as never));
  // After any write: toast, clear errors, reload the object — or open the freshly created one.
  const done = async (id: string, msg: string) => {
    for (const k of ["objects", "counts", "mine", "approvals"]) void qc.invalidateQueries({ queryKey: [...studioKeys.all, k] });
    c.markSaved();
    successHaptic();
    toast(msg, "ok");
    c.setErrors({});
    if (c.id) c.apply(await refresh(id));
    else open(id);
  };
  return { busy, error, setError, run, persist, done, refresh, open, errText };
}
