import * as DocumentPicker from "expo-document-picker";
import type { DocxFile } from "@/entities/admin-services";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// System file picker for one .docx; null when cancelled, "badType" for anything else.
export async function pickDocx(): Promise<DocxFile | "badType" | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: [DOCX], copyToCacheDirectory: true, multiple: false });
  const a = res.canceled ? null : res.assets[0];
  if (!a) return null;
  return /\.docx$/i.test(a.name) ? { uri: a.uri, name: a.name } : "badType";
}
