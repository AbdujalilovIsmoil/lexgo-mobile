import type { PriceBand } from "../model/serviceTypes";

export const digitsOf = (v: string) => v.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 12);

export const outOfBand = (price: number, band: PriceBand | null) => !!band && price > 0 && band.max > 0 && price > band.max;

// The server's recommended price when it lies inside the range, else the ceiling.
export const recommended = (b: PriceBand) => (b.recommended >= b.min && b.recommended <= b.max ? b.recommended : b.max);

// Allowed range as a share of the recommended price, e.g. 70 / 100.
export const percents = (b: PriceBand | null) => (b && b.recommended > 0 ? { lo: Math.round((b.min / b.recommended) * 100), hi: Math.round((b.max / b.recommended) * 100) } : null);
