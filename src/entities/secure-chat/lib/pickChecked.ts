import { pickDocuments, pickImages } from "@/shared/lib/upload";
import { toast } from "@/shared/ui";
import type { PickedFile } from "../model/types";
import { screenFiles } from "./fileRules";
import { REFUSAL_MS, refusalText } from "./refusal";

type Tr = (key: string, params?: Record<string, string | number>) => string;

// Picks documents, gallery photos or a camera photo for the secure upload and keeps only what the server takes (its allowed types,
// 50 MB, 200 MB for MP4 / MOV); the rest is named in a toast with the reason. Used by the chat, the checklist proof and the result.
export async function pickChecked(kind: "photo" | "camera" | "file", t: Tr): Promise<PickedFile[]> {
  const res = kind === "file" ? await pickDocuments({ multiple: true }) : await pickImages({ camera: kind === "camera", multiple: true });
  if (!res) return [];
  const { ok, badType, tooBig } = screenFiles(res.files);
  if (badType.length) toast(refusalText(t, { kind: "type" }, badType.map((f) => f.name)), "err", REFUSAL_MS);
  if (tooBig.length) toast(refusalText(t, { kind: "size" }, tooBig.map((f) => f.name)), "err", REFUSAL_MS);
  return ok;
}
