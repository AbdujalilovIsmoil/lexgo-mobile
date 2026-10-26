import { http } from "@/shared/api";
import { appendFile } from "@/shared/lib/upload";
import { listFrom } from "@/shared/lib/json";
import { normDocs, normProgress } from "./normalize";

export const getProgress = async () => normProgress(await http("/seller-onboarding/progress"));
export const listDocs = async () => normDocs(listFrom(await http("/seller-onboarding"), "items", "data"));

// Multipart: `file` (PDF / JPG / PNG, ≤ 15 MB, checked before it leaves the phone) + `document_type`.
export async function uploadDoc(file: { uri: string; name: string }, documentType: string): Promise<void> {
  const form = new FormData();
  appendFile(form, "file", file);
  form.append("document_type", documentType);
  await http("/seller-onboarding/documents", { method: "POST", body: form });
}

// 422 while required steps are missing; repeating the call returns the open submission.
export const submitOnboarding = async (): Promise<void> => {
  await http("/seller-onboarding/submit", { method: "POST" });
};
