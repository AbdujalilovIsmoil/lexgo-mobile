import { File } from "expo-file-system";
import { bundledText, keepOnSuccess } from "@/shared/lib/bundled";
import HTML from "../../../../assets/doc/docx.html";

// The page that turns a .docx into HTML (assets/doc/docx.html = mammoth + a receiver), read once per app run from the
// packaged file (a release build has no dev server to fetch it from).
export const loadDocxPage = keepOnSuccess(() => bundledText(HTML));

// A local file as base64, ready to hand to that page.
export async function readBase64(uri: string): Promise<string> {
  const bytes = new Uint8Array(await new File(uri).arrayBuffer());
  let out = "";
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(out);
}
