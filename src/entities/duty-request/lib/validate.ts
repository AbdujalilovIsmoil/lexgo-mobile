import type { Attach } from "../model/types";

export const LIMITS = { fileMb: 25, voiceMb: 25, maxFiles: 10, maxVoices: 3, needMax: 4000 };
const FILE_EXT = /\.(pdf|docx?|odt|rtf|txt|xlsx?|png|jpe?g|webp|heic)$/i;
const VOICE_EXT = /\.(m4a|mp3|wav|ogg|aac|webm|opus|mp4)$/i;
const FILE_EXT_LIST = "PDF, DOCX, TXT, XLSX, JPG, PNG";

export type AttachError = "badType" | "tooBig";
// What a file of the request must be: its size limit, the extensions taken and the list as the hint reads it.
export type FileRule = { mb: number; exts: RegExp; list: string };
// Supporting files and photos keep the phone's own wide list; their size follows the document service settings when given.
export const attachRule = (mb: number = LIMITS.fileMb): FileRule => ({ mb, exts: FILE_EXT, list: FILE_EXT_LIST });

// Checked on the phone before anything is uploaded (TZ 40): extension, audio mime, size.
export function checkAttach(f: Attach, kind: "file" | "voice", rule: FileRule = attachRule()): AttachError | null {
  const voice = kind === "voice";
  if (!(voice ? VOICE_EXT : rule.exts).test(f.name)) return "badType";
  if (voice && f.mime && !/^(audio|video)\//i.test(f.mime)) return "badType";
  const mb = voice ? LIMITS.voiceMb : rule.mb;
  return f.size > mb * 1024 * 1024 ? "tooBig" : null;
}

export const isRecordedVoice = (f: Attach): boolean => VOICE_EXT.test(f.name);
