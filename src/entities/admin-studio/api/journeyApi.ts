import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import { listOf, totalOf } from "../lib/norm";
import { enc, qs } from "../lib/qs";
import type { Journey, JourneyDef, JourneyStep } from "../model/typesJourney";

const bool = (v: unknown): boolean => v === true;
const step = (raw: unknown, i: number): JourneyStep => {
  const d = asDict(raw);
  const code = asStr(d.constructor_code);
  return { key: asStr(d.key), title: asStr(d.title), code, formCode: asStr(d.form_constructor_code) || code, sourceCode: asStr(d.source_constructor_code) || code, order: asNum(d.order, i + 1), required: d.required !== false };
};
const stepsOf = (v: unknown): JourneyStep[] => asArr(v).map(step).filter((s) => s.key).sort((a, b) => a.order - b.order);

function journey(raw: unknown): Journey {
  const d = asDict(raw);
  const a = asDict(d.allowed_actions);
  const steps = stepsOf(d.steps);
  return {
    id: asStr(d.id),
    type: asStr(d.journey_type ?? d.type),
    title: asStr(d.title),
    status: asStr(d.status),
    steps,
    completed: asArr(d.completed_steps).map((x) => asStr(x)).filter(Boolean),
    currentStep: asStr(d.current_step),
    done: asNum(d.completed_count, 0),
    total: asNum(d.total_count, steps.length),
    percent: asNum(d.progress_percent, 0),
    context: asDict(d.context),
    actions: { update: bool(a.update), abandon: bool(a.abandon), archive: bool(a.archive), restore: bool(a.restore) },
    updatedAt: asStr(d.updated_at),
  };
}

// GET /studio/journeys — the user's creation flows; `incomplete_count` is the server's.
export async function listJourneys(q: { status?: string; type?: string; limit?: number; offset?: number } = {}): Promise<{ items: Journey[]; total: number; incomplete: number }> {
  const res = await http(`/studio/journeys${qs({ status: q.status, journey_type: q.type, limit: q.limit, offset: q.offset })}`);
  const items = listOf(res).map(journey).filter((j) => j.id);
  return { items, total: totalOf(res, items.length), incomplete: asNum(asDict(res).incomplete_count, 0) };
}
export const getJourney = async (id: string): Promise<Journey> => journey(await http(`/studio/journeys/${enc(id)}`));

// GET /studio/journey-definitions — the step list of every journey type.
export async function listJourneyDefs(): Promise<JourneyDef[]> {
  const res = asDict(await http("/studio/journey-definitions"));
  return asArr(res.items ?? res.definitions).map((x) => ({ type: asStr(asDict(x).journey_type ?? asDict(x).type), steps: stepsOf(asDict(x).steps) })).filter((d) => d.type);
}

export const startJourney = async (i: { type: string; title: string }): Promise<Journey> => journey(await http("/studio/journeys", { method: "POST", body: { journey_type: i.type, title: i.title, context: {} } }));
export const patchJourney = async (id: string, i: { completed: string[]; current: string; context?: Record<string, unknown> }): Promise<Journey> =>
  journey(await http(`/studio/journeys/${enc(id)}`, { method: "PATCH", body: { completed_steps: i.completed, current_step: i.current, context: i.context ?? {} } }));
export const journeyAction = async (id: string, action: "abandon" | "archive" | "restore"): Promise<Journey> => journey(await http(`/studio/journeys/${enc(id)}/${action}`, { method: "POST" }));
