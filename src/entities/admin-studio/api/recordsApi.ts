import { http } from "@/shared/api";
import { listOf, totalOf } from "../lib/norm";
import { normContext, normRecord } from "../lib/normRecords";
import { enc, qs } from "../lib/qs";
import type { FormContext, StudioRecord } from "../model/typesNav";

// GET /studio/constructors/{code}/records — published runtime records and studio objects together.
export async function listRecords(code: string, limit: number, offset: number): Promise<{ items: StudioRecord[]; total: number }> {
  const res = await http(`/studio/constructors/${enc(code)}/records${qs({ limit, offset })}`);
  const items = listOf(res).map(normRecord).filter((r) => r.id);
  return { items, total: totalOf(res, items.length) };
}

// GET /studio/constructors/{code}/form-context — opens a record for edit/clone; without `record` it is the create context.
export async function getFormContext(code: string, mode: string, record = "", source = ""): Promise<FormContext> {
  return normContext(await http(`/studio/constructors/${enc(code)}/form-context${qs({ mode, record_id: record, source })}`));
}
