// Whole-number typing: only digits are kept, the value is capped at `max` and 0 shows as an empty field.
export const digitsMax = (max = 99_999_999_999) => (v: string): string => {
  const n = Math.min(max, Number(v.replace(/\D/g, "")) || 0);
  return n ? String(n) : "";
};
