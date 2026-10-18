import { asDict } from "@/shared/lib/json";
import type { FormContext, StudioRecord } from "../model/typesNav";
import { first } from "./norm";

export function normRecord(raw: unknown): StudioRecord {
  const r = asDict(raw);
  return {
    id: first(r.record_id, r.id),
    title: first(r.title),
    status: first(r.status),
    source: first(r.source),
    objectId: first(r.studio_object_id),
    runtimeType: first(r.runtime_target_type),
    updatedAt: first(r.updated_at),
  };
}

// The seed of a form: payload without the context-managed ids; the backend injects them on save.
export function normContext(raw: unknown): FormContext {
  const r = asDict(raw);
  const submit = asDict(r.submit);
  return {
    mode: first(r.mode),
    title: first(r.title),
    payload: asDict(r.initial_payload),
    targetId: first(submit.runtime_target_id, asDict(r.context).runtime_target_id),
    targetType: first(submit.runtime_target_type, asDict(r.context).runtime_target_type),
  };
}
