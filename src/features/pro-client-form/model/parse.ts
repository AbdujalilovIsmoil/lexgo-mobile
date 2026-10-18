// "a, b; c" → ["a", "b", "c"].
export const splitList = (s: string): string[] => s.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
export const digits = (s: string, max: number): string => s.replace(/\D/g, "").slice(0, max);
