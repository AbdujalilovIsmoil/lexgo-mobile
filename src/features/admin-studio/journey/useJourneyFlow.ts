import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { checkPayload, createObject, getObject, patchJourney, saveObject, studioError, studioKeys, submitObject, useJourney, useStudioAccess, useStudioErrorText, type Journey, type JourneyStep, type StudioPayload } from "@/entities/admin-studio";
import { asStr } from "@/shared/lib/json";
import { successHaptic } from "@/shared/lib/haptics";
import { normErrors } from "../object/errors";
import type { Errors } from "../form/types";

const ctxId = (j: Journey): string => asStr(j.context.studio_object_id);
const topKey = (field: string): string => field.split(/[.[]/)[0];

// The creation journey as a flow: each step saves the one Studio object (created by the first save, remembered in the journey's
// context) and moves the journey on; the last step checks the whole payload on the server and sends it for approval.
export function useJourneyFlow(id: string) {
  const qc = useQueryClient();
  const errText = useStudioErrorText();
  const access = useStudioAccess();
  const q = useJourney(id);
  const j = q.data;
  const step0 = j?.steps.find((s) => s.key === j.currentStep) ?? j?.steps.find((s) => !j.completed.includes(s.key)) ?? j?.steps[0];
  const ctor = access.constructors.find((c) => c.code === (step0?.formCode || step0?.code)) ?? null;
  const [at, setAt] = useState("");
  const objectId = j ? ctxId(j) : "";
  const [draft, setPayload] = useState<StudioPayload>({});
  const [errors, setErrors] = useState<Errors>({});
  const [bad, setBad] = useState<string[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const loaded = useRef("");
  // Before the first save the object is only the journey's title.
  const payload: StudioPayload = { ...(j && !objectId ? { title: j.title } : {}), ...draft };

  // Load the saved object's payload once.
  useEffect(() => {
    if (!j || loaded.current === `${j.id}:${objectId}`) return;
    loaded.current = `${j.id}:${objectId}`;
    if (!objectId) return;
    void getObject(objectId).then((o) => setPayload(o.payload)).catch((e) => setError(errText(e)));
  }, [j, objectId, errText]);
  const current = j?.steps.find((s) => s.key === (at || step0?.key)) ?? step0;

  const fail = (e: unknown) => {
    const se = studioError(e);
    if (Object.keys(se.fieldErrors).length) setErrors(normErrors(se.fieldErrors));
    setError(Object.keys(se.fieldErrors).length ? "" : errText(e));
    return false;
  };
  const run = async (b: string, fn: () => Promise<void>): Promise<boolean> => {
    setBusy(b);
    setError("");
    try {
      await fn();
      return true;
    } catch (e) {
      return fail(e);
    } finally {
      setBusy("");
    }
  };
  const persist = async (): Promise<string> => {
    if (!j) return "";
    const title = asStr(payload.title).trim() || j.title;
    const body = { ...payload, title };
    if (objectId) return (await saveObject(objectId, { title, payload: body }), objectId);
    return (await createObject(current?.formCode || "K02", title, body)).id;
  };
  const advance = async (done: JourneyStep, oid: string): Promise<Journey> => {
    if (!j) throw new Error("no journey");
    const completed = [...new Set([...j.completed, done.key])];
    const next = j.steps.find((s) => !completed.includes(s.key))?.key ?? done.key;
    const out = await patchJourney(j.id, { completed, current: next, context: { ...j.context, studio_object_id: oid, constructor_code: done.formCode } });
    qc.setQueryData([...studioKeys.all, "journeys", "one", j.id], out);
    void qc.invalidateQueries({ queryKey: [...studioKeys.all, "journeys"] });
    return out;
  };

  // "Save and continue": store the payload, mark the step, open the next one.
  const saveStep = (s: JourneyStep) => run("save", async () => {
    const oid = await persist();
    const out = await advance(s, oid);
    setErrors({});
    successHaptic();
    setAt(out.steps.find((x) => !out.completed.includes(x.key))?.key ?? s.key);
  });

  // The last step: the server checks everything, wrong steps are listed, a clean payload goes for approval.
  const send = async (s: JourneyStep): Promise<boolean> => {
    let clean = true;
    const ok = await run("send", async () => {
      const oid = await persist();
      const check = await checkPayload(s.formCode || "K02", payload);
      if (!check.ok) {
        clean = false;
        const map: Errors = {};
        check.errors.forEach((e) => { map[e.field] = e.message; });
        setErrors(normErrors(map));
        const roots = new Set(check.errors.map((e) => topKey(e.field)));
        setBad((j?.steps ?? []).filter((st) => st.fields.some((f) => roots.has(f))).map((st) => st.key));
        return;
      }
      setBad([]);
      await submitObject(oid);
      await advance(s, oid);
      void qc.invalidateQueries({ queryKey: studioKeys.all });
      successHaptic();
      setSent(true);
    });
    return ok && clean;
  };

  return { journey: j, loading: q.isLoading, loadError: q.error, reload: () => void q.refetch(), ctor, current, setAt, payload, setPayload, errors, setErrors, bad, busy, error, sent, objectId, saveStep, send, readOnly: !access.canEdit || (j ? !j.actions.update : true) };
}
