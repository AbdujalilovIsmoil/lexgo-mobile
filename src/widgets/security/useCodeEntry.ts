import { useState } from "react";

// The typed code of a sheet, tied to the challenge it belongs to: a new challenge
// (resend, re-open) starts with an empty field without any reset effect.
export function useCodeEntry(challengeId: string): [string, (v: string) => void] {
  const [entry, setEntry] = useState({ id: "", value: "" });
  return [entry.id === challengeId ? entry.value : "", (value) => setEntry({ id: challengeId, value })];
}
