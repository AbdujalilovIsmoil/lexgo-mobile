import * as DocumentPicker from "expo-document-picker";
import type { PickedFile } from "@/entities/admin-templates";

export type ImportMode = "docx" | "zip";

// System picker for one DOCX or one ZIP; null when cancelled, "badType" when the extension does not match the mode.
export async function pickImportFile(mode: ImportMode): Promise<PickedFile | "badType" | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true, multiple: false });
  const a = res.canceled ? null : res.assets[0];
  if (!a) return null;
  return new RegExp(`\\.${mode}$`, "i").test(a.name) ? { uri: a.uri, name: a.name } : "badType";
}

export const slugOf = (name: string): string => name.replace(/\.(docx|zip)$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
