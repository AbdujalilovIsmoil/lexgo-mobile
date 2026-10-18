import { useColors } from "@/shared/theme";
import type { Tone } from "../lib/status";

// Accent colour of a status tone (hex, so callers may append an alpha).
export function useToneColor(): (tone: Tone) => string {
  const c = useColors();
  const map: Record<Tone, string> = { ok: c.ok, warn: c.warn, blue: c.accent, err: c.err, gray: c.gray };
  return (tone) => map[tone];
}
