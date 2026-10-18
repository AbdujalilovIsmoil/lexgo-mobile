import { pickDocuments } from "@/shared/lib/upload";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export type Docx = { uri: string; name: string };

// Pick one .docx (the only editable source): null = cancelled, throws "tooBig" / "badType".
export async function pickDocx(): Promise<Docx | null> {
  const r = await pickDocuments({ types: [DOCX], exts: /\.docx$/i, maxMb: 25 });
  if (!r) return null;
  if (r.error) throw new Error(r.error);
  return r.files[0] ?? null;
}
