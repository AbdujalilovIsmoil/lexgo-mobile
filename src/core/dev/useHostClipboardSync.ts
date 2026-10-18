// Android, web and release builds have nothing to sync: Android's emulator shares
// the clipboard by itself. The iOS version is in useHostClipboardSync.ios.ts.
export function useHostClipboardSync(): void {}
