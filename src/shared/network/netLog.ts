import { File, Paths } from "expo-file-system";

// A small journal of what the connection monitor saw (OS state, probe results, the verdict), kept across launches in
// Documents/net-diag.log so "no internet while the internet works" can be explained afterwards: it can be shared from the storage
// settings or copied off a phone plugged into a Mac. Only states, timings and the OS's error texts — no addresses, tokens or user data.
const MAX = 250;
const NAME = "net-diag.log";
let lines: string[] | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function file(): File | null {
  try {
    return new File(Paths.document, NAME);
  } catch {
    return null;
  }
}

function load(): string[] {
  if (lines) return lines;
  lines = [];
  try {
    const f = file();
    if (f?.exists) lines = f.textSync().split("\n").filter(Boolean).slice(-MAX);
  } catch {
    /* unreadable: start over */
  }
  return lines;
}

function save(): void {
  timer = null;
  try {
    file()?.write(load().join("\n") + "\n");
  } catch {
    /* the journal is a convenience: never let it break anything */
  }
}

export function netLog(event: string, detail = ""): void {
  const all = load();
  all.push(`${new Date().toISOString()} ${event}${detail ? ` ${detail}` : ""}`);
  if (all.length > MAX) all.splice(0, all.length - MAX);
  if (!timer) timer = setTimeout(save, 1000);
}

export const netLogText = (): string => load().join("\n");
