import { Image } from "react-native";
import { Asset } from "expo-asset";
import { File } from "expo-file-system";

// A file packaged with the app (html, glb …) as a readable File. A release build has no Metro server: the file is an
// Android raw resource or an iOS bundle file, so `fetch(Image.resolveAssetSource(x).uri)` only worked in dev. expo-asset
// copies it to a real file:// uri.
async function bundledFile(mod: number): Promise<File> {
  const asset = Asset.fromModule(mod);
  if (!asset.localUri) await asset.downloadAsync();
  return new File(asset.localUri ?? asset.uri);
}

// Its text; the dev-server fetch stays as the fallback.
export async function bundledText(mod: number): Promise<string> {
  try {
    return await (await bundledFile(mod)).text();
  } catch {
    return (await fetch(Image.resolveAssetSource(mod).uri)).text();
  }
}

// Its bytes; the dev-server fetch stays as the fallback.
export async function bundledBytes(mod: number): Promise<Uint8Array> {
  try {
    return await (await bundledFile(mod)).bytes();
  } catch {
    return new Uint8Array(await (await fetch(Image.resolveAssetSource(mod).uri)).arrayBuffer());
  }
}

// A promise kept for the whole run, but dropped when it fails, so the next caller tries again.
export function keepOnSuccess<T>(make: () => Promise<T>): () => Promise<T> {
  let p: Promise<T> | null = null;
  return () => (p ??= make().catch((e) => { p = null; throw e; }));
}
