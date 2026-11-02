import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { appendFile } from "@/shared/lib/upload";

// POST /workspace/files/upload (multipart "file") — the user's own file store; its id is the `file_id` the purchase request carries.
export async function uploadPurchaseFile(file: { uri: string; name: string }): Promise<{ id: string; name: string }> {
  const form = new FormData();
  appendFile(form, "file", file);
  const d = asDict(await http("/workspace/files/upload", { method: "POST", body: form }));
  const f = Object.keys(asDict(d.file)).length ? asDict(d.file) : d;
  return { id: asStr(f.id ?? f.file_id), name: asStr(f.file_name ?? f.name, file.name) };
}
