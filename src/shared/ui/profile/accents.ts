// Per-section accent gradients of the profile (brand blue + a family of web-friendly hues).
export const ACCENTS = {
  blue: ["#1668F0", "#00A6E6"],
  green: ["#00A870", "#34D399"],
  violet: ["#7C3AED", "#A78BFA"],
  sky: ["#0284C7", "#38BDF8"],
  rose: ["#E11D74", "#FB923C"],
  indigo: ["#4338CA", "#6366F1"],
  gold: ["#C98A0B", "#F5C542"],
  amber: ["#EA7A0C", "#FDBA3B"],
  teal: ["#0D9488", "#2DD4BF"],
  red: ["#DC2626", "#F87171"],
  slate: ["#475569", "#94A3B8"],
} as const;

export type Accent = keyof typeof ACCENTS;
