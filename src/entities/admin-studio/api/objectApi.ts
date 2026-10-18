import { http } from "@/shared/api";
import { normDetail, normObject } from "../lib/normObject";
import { listOf, totalOf } from "../lib/norm";
import { enc, qs } from "../lib/qs";
import type { StudioDecision, StudioDetail, StudioObject, StudioPayload } from "../model/types";
import type { StudioListQuery, StudioPage } from "../model/typesAdmin";

const post = async (path: string, body?: unknown): Promise<StudioDetail> => normDetail(await http(path, { method: "POST", body }));

// GET /studio/objects — one page of objects (filters: constructor, status, assigned to me).
export async function listObjects(q: StudioListQuery = {}): Promise<StudioPage<StudioObject>> {
  const res = await http(`/studio/objects${qs({ constructor_code: q.code, status: q.status, assigned_to_me: q.mine, limit: q.limit, offset: q.offset })}`);
  const items = listOf(res).map(normObject).filter((o) => o.id);
  return { items, total: totalOf(res, items.length) };
}

export const getObject = async (id: string): Promise<StudioDetail> => normDetail(await http(`/studio/objects/${enc(id)}`));
// `target` attaches the new object to an existing published record (service, package …); the backend injects its id into the payload.
export type ObjectTarget = { id: string; type: string };
export const createObject = (code: string, title: string, payload: StudioPayload, target?: ObjectTarget) =>
  post("/studio/objects", { constructor_code: code, title, payload, ...(target?.id ? { runtime_target_id: target.id, ...(target.type ? { runtime_target_type: target.type } : {}) } : {}) });

type SaveInput = { title: string; payload: StudioPayload; summary?: string; version?: string };
export const saveObject = (id: string, i: SaveInput) =>
  post(`/studio/objects/${enc(id)}/save`, { title: i.title, payload: i.payload, ...(i.summary ? { summary: i.summary } : {}), ...(i.version ? { version: i.version } : {}) });

export const submitObject = (id: string) => post(`/studio/objects/${enc(id)}/submit`);
export const archiveObject = (id: string) => post(`/studio/objects/${enc(id)}/archive`);
export const publishObject = (id: string, note = "") => post(`/admin/studio/objects/${enc(id)}/publish`, { note });
export const rollbackObject = (id: string, versionId: string, note = "") => post(`/admin/studio/objects/${enc(id)}/rollback`, { version_id: versionId, note });
export const reviewObject = (id: string, decision: StudioDecision, comment = "") => post(`/admin/studio/objects/${enc(id)}/review`, { decision, comment });
