import { useState } from "react";

// Keeps the last non-null value so a sheet's content stays while it animates out.
export function useKept<T>(value: T | null): T | null {
  const [kept, setKept] = useState<T | null>(value);
  if (value && value !== kept) setKept(value);
  return value ?? kept;
}
