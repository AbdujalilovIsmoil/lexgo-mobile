import * as DocumentPicker from "expo-document-picker";
import { STUDIO_FILE_EXT, fileExt } from "@/entities/admin-studio";
import type { PickedFile } from "../form/types";

const TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
];

export type PickResult = { file?: PickedFile; error?: "badType" | "empty" };

// System file picker for .docx .doc .pdf .xlsx .xls .txt (the formats the studio accepts); null = cancelled.
export async function pickStudioFile(): Promise<PickResult | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: TYPES, copyToCacheDirectory: true, multiple: false });
  const a = res.canceled ? null : res.assets[0];
  if (!a) return null;
  if (!STUDIO_FILE_EXT.includes(`.${fileExt(a.name)}`)) return { error: "badType" };
  if (a.size === 0) return { error: "empty" };
  return { file: { uri: a.uri, name: a.name } };
}
