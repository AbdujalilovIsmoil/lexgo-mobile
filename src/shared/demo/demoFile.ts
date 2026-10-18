import { demoPdf } from "./demoPdf";

// Writes the generated PDF to the cache and returns its uri.
export async function demoFileUri(id: string, name: string): Promise<string> {
  const FS = await import("expo-file-system/legacy");
  const uri = `${FS.cacheDirectory}${id}.pdf`;
  await FS.writeAsStringAsync(uri, demoPdf(name));
  return uri;
}
