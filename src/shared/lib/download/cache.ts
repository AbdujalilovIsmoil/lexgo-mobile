import { Directory, Paths } from "expo-file-system";
import { registerSessionReset } from "../sessionReset";

// Downloaded documents live here; confidential content is wiped on logout / role change.
export const filesDir = (): Directory => new Directory(Paths.cache, "lexgo-files");

export function clearFileCache(): void {
  try {
    const dir = filesDir();
    if (dir.exists) dir.delete();
  } catch {
    /* nothing cached */
  }
}

registerSessionReset(clearFileCache);
