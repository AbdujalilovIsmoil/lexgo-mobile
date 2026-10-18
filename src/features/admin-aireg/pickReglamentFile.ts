import * as DocumentPicker from "expo-document-picker";

export const MAX_MB = 20;
const EXT = /\.(docx|doc|pdf)$/i;
const TYPES = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "application/pdf"];

export type PickedReglamentFile = { uri: string; name: string; size: number };
export type PickResult = { file?: PickedReglamentFile; error?: "badType" | "tooBig" | "empty" };

// System file picker for a reglament document (.docx, .doc, .pdf, up to 20 MB — the web's limits).
export async function pickReglamentFile(): Promise<PickResult | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: TYPES, copyToCacheDirectory: true, multiple: false });
  const a = res.canceled ? null : res.assets[0];
  if (!a) return null;
  if (!EXT.test(a.name)) return { error: "badType" };
  if ((a.size ?? 0) > MAX_MB * 1024 * 1024) return { error: "tooBig" };
  if (a.size === 0) return { error: "empty" };
  return { file: { uri: a.uri, name: a.name, size: a.size ?? 0 } };
}

export const titleFromFile = (name: string) => name.replace(/\.[^.]+$/, "").replace(/_+/g, " ").replace(/\s+/g, " ").trim();
