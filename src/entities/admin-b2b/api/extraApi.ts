import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom, uzs } from "@/shared/lib/json";
import { normRecord } from "@/shared/lib/adm/record";
import type { B2bProduct, B2bTask, PipelineStage, ProductInput, TimelineEvent } from "../model/typesExtra";

// GET /b2b/pipeline — every stage with its count, total value and clients.
export async function getPipeline(): Promise<PipelineStage[]> {
  return asArr(asDict(await http("/b2b/pipeline")).stages).map((s) => {
    const d = asDict(s);
    return {
      stage: asStr(d.stage), count: asNum(d.count), value: uzs(d, "value"),
      items: asArr(d.items).map((i) => {
        const x = asDict(i);
        const p = asDict(x.payload);
        return { id: asStr(x.id), name: asStr(x.name), value: uzs(x, "value"), industry: asStr(p.industry), contact: asStr(p.contact), updatedAt: asStr(x.updated_at) };
      }),
    };
  });
}

// GET /b2b/clients/{id}/timeline — created / stage changes / documents, newest first.
export async function getTimeline(clientId: string): Promise<TimelineEvent[]> {
  return listFrom(await http(`/b2b/clients/${encodeURIComponent(clientId)}/timeline`), "items", "data").map((v) => {
    const r = normRecord(v);
    return { id: r.id, type: r.type, title: r.title, from: asStr(r.payload.from), to: asStr(r.payload.to), createdAt: r.createdAt };
  });
}

// GET /b2b/tasks — work items of corporate clients.
export async function listB2bTasks(): Promise<B2bTask[]> {
  return listFrom(await http("/b2b/tasks"), "items", "data", "tasks").map((v) => {
    const d = asDict(v);
    return { id: asStr(d.id), title: asStr(d.title ?? d.name), status: asStr(d.status, "todo"), due: asStr(d.due_date ?? d.deadline_at), clientId: asStr(d.b2b_client_id ?? asDict(d.payload).b2b_client_id) };
  }).filter((t) => t.id);
}

const product = (v: unknown): B2bProduct => { const r = normRecord(v); return { id: r.id, workId: r.workId, title: r.title, status: r.status, price: r.price, description: asStr(r.payload.description) }; };
export const listProducts = async () => listFrom(await http("/b2b/products"), "items", "data").map(product).filter((p) => p.id);
// POST /b2b/products (MarketplaceRecordCreate). The API has no update / delete for products.
export const createProduct = async (i: ProductInput) => product(await http("/b2b/products", { method: "POST", body: { record_type: "product", title: i.title, price: i.price, status: "active", payload: { description: i.description } } }));
