import type { Attach } from "../model/types";

export const LIMITS = { fileMb: 25, voiceMb: 25, maxFiles: 10, maxVoices: 3, needMax: 4000 };
const FILE_EXT = /\.(pdf|docx?|odt|rtf|txt|xlsx?|png|jpe?g|webp|heic)$/i;
const VOICE_EXT = /\.(m4a|mp3|wav|ogg|aac|webm|opus|mp4)$/i;
export const FILE_EXT_LIST = "PDF, DOCX, TXT, XLSX, JPG, PNG";

export type AttachError = "badType" | "tooBig";

// Checked on the phone before anything is uploaded (TZ 40): extension, audio mime, size.
export function checkAttach(f: Attach, kind: "file" | "voice"): AttachError | null {
  const voice = kind === "voice";
  if (!(voice ? VOICE_EXT : FILE_EXT).test(f.name)) return "badType";
  if (voice && f.mime && !/^(audio|video)\//i.test(f.mime)) return "badType";
  const mb = voice ? LIMITS.voiceMb : LIMITS.fileMb;
  return f.size > mb * 1024 * 1024 ? "tooBig" : null;
}

export const isRecordedVoice = (f: Attach): boolean => VOICE_EXT.test(f.name);
