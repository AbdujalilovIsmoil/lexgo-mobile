import * as Clipboard from "expo-clipboard";

// Clipboard policy: plain text is copied as is; a secret (recovery code, requisites, signing code)
// is wiped from the clipboard after 30 s, but only if it is still what we put there.
const SECRET_TTL_MS = 30_000;
let wipe: ReturnType<typeof setTimeout> | undefined;

export async function copyText(text: string, opts: { secret?: boolean } = {}): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
  } catch {
    return false;
  }
  clearTimeout(wipe);
  if (opts.secret) {
    wipe = setTimeout(() => {
      void Clipboard.getStringAsync()
        .then((now) => (now === text ? Clipboard.setStringAsync("") : undefined))
        .catch(() => {});
    }, SECRET_TTL_MS);
  }
  return true;
}
