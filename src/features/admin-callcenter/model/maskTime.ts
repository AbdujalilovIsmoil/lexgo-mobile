// HH:MM input: digits only, the colon is added while typing.
export const maskTime = (raw: string): string => {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
};
export const isTime = (v: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
