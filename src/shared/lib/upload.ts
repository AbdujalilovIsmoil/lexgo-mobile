import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Directory, File, Paths } from "expo-file-system";
import { safeUploadName, uploadDirName } from "./safeName";
import { extOf } from "./download/fileKind";

export type Picked = { uri: string; name: string; mime: string; size: number };
export type PickError = "tooBig" | "badType";
export type PickOut = { files: Picked[]; error?: PickError } | null;
type Opts = { types?: string[]; exts?: RegExp; multiple?: boolean; maxMb?: number };

const guessMime = (name: string): string => {
  const e = extOf(name);
  return e === "pdf" ? "application/pdf" : e === "txt" ? "text/plain" : /^(png|jpe?g|webp|gif)$/.test(e) ? `image/${e === "jpg" ? "jpeg" : e}` : "application/octet-stream";
};

// Validate size (MB) and extension before anything leaves the phone (TZ 40).
function check(list: Picked[], o: Opts): PickOut {
  const bad = list.find((f) => (o.exts && !o.exts.test(f.name)) || false);
  if (bad) return { files: [], error: "badType" };
  const big = list.find((f) => o.maxMb != null && f.size > o.maxMb * 1024 * 1024);
  return big ? { files: [], error: "tooBig" } : { files: list };
}

// System document picker → validated list (null = cancelled).
export async function pickDocuments(o: Opts = {}): Promise<PickOut> {
  const res = await DocumentPicker.getDocumentAsync({ type: o.types ?? "*/*", multiple: !!o.multiple, copyToCacheDirectory: true });
  if (res.canceled) return null;
  return check(res.assets.map((a) => ({ uri: a.uri, name: a.name, size: a.size ?? 0, mime: a.mimeType ?? guessMime(a.name) })), o);
}

// Gallery (or camera) image(s), same validation.
export async function pickImages(o: Opts & { camera?: boolean } = {}): Promise<PickOut> {
  const launch = o.camera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
  const res = await launch({ mediaTypes: ["images"], allowsMultipleSelection: !!o.multiple && !o.camera, quality: 0.85 });
  if (res.canceled) return null;
  const list = res.assets.map((a, i) => ({ uri: a.uri, name: a.fileName ?? `photo-${Date.now()}-${i}.jpg`, size: a.fileSize ?? 0, mime: a.mimeType ?? "image/jpeg" }));
  return check(list, o);
}

// Expo's fetch rejects { uri, name, type } parts; a real File from expo-file-system works. The part is named after the file on
// disk (percent-encoded by the fetch layer), so a name that is not plain is first copied under a plain one. Any failure of the
// copy (content:// uri, permissions, size mismatch) falls back to the original file under its original name. The copies stay in
// the cache until the OS clears it: deleting one before the request body is read would send an empty file.
export function appendFile(form: FormData, field: string, f: Pick<Picked, "uri" | "name">): void {
  const src = new File(f.uri);
  const plain = safeUploadName(f.name);
  if (src.name !== plain) {
    try {
      const dir = new Directory(Paths.cache, uploadDirName());
      dir.create({ idempotent: true });
      const dst = new File(dir, plain);
      src.copySync(dst);
      const copy = new File(dst.uri); // a fresh handle: the one made before the copy would still describe an empty file
      if (copy.size !== src.size) throw new Error("copy"); // never send a half-copied or empty file
      form.append(field, copy as unknown as Blob, plain);
      return;
    } catch {
      /* fall through: send the original */
    }
  }
  form.append(field, src as unknown as Blob, f.name);
}
