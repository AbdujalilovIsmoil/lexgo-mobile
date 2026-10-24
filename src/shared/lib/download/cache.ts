import { Directory, File, Paths } from "expo-file-system";
import { registerSessionReset } from "../sessionReset";

// Downloaded documents live here; confidential content is wiped on logout / role change.
export const filesDir = (): Directory => new Directory(Paths.cache, "lexgo-files");

// Files the app writes straight into the cache folder: voice notes, scans and their OCR images, exported scans, upload copies.
const LOOSE = /^(voice-|scan-|ocr-|proof-)/;

export function clearFileCache(): void {
  try {
    const dir = filesDir();
    if (dir.exists) dir.delete();
  } catch {
    /* nothing cached */
  }
  // A voice note or a scan is the user's content too: it must not outlive the session either.
  try {
    for (const item of new Directory(Paths.cache).list()) {
      if (item instanceof File && LOOSE.test(item.name)) item.delete();
      else if (item instanceof Directory && item.name.startsWith("up-")) item.delete(); // uploadDirName()
    }
  } catch {
    /* nothing to remove */
  }
}

registerSessionReset(clearFileCache);
