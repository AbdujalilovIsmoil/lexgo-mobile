import { Image } from "react-native";
import { File } from "expo-file-system";
import HTML from "../../../../assets/doc/docx.html";

let html: Promise<string> | null = null;

// The page that turns a .docx into HTML (assets/doc/docx.html = mammoth + a receiver), fetched once per app run.
export const loadDocxPage = (): Promise<string> => (html ??= fetch(Image.resolveAssetSource(HTML).uri).then((r) => r.text()));

// A local file as base64, ready to hand to that page.
export async function readBase64(uri: string): Promise<string> {
  const bytes = new Uint8Array(await new File(uri).arrayBuffer());
  let out = "";
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(out);
}
