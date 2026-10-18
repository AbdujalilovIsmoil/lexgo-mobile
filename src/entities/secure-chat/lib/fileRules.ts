// What may leave the phone in a secure chat (TZ 40: MIME, extension and size are checked before upload).
// The server refuses executables / scripts with 415; the same list is checked here first.
export const MAX_MB = 25; // past this an upload on a phone connection times out
export const DENIED_EXT = "exe|bat|cmd|com|msi|scr|sh|bash|zsh|ps1|vbs|js|mjs|jar|apk|ipa|dll|so|app|dmg|pif|cpl|reg|lnk|php|py|rb";
/** Passed as `exts` to pickDocuments: true = allowed. */
export const CHAT_EXTS = new RegExp(`^(?!.*\\.(?:${DENIED_EXT})$)`, "i");
export const isAllowedName = (name: string): boolean => CHAT_EXTS.test(name);
