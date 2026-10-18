// Real-card colours per payment brand (gradient stops); unknown brands fall back to the brand navy.
const FACES: Record<string, readonly [string, string]> = {
  uzcard: ["#0E3F8F", "#1B8FD1"],
  humo: ["#0A6B5F", "#16B79E"],
  visa: ["#1A1F71", "#4B5BD6"],
  mastercard: ["#23252F", "#D9480F"],
};

export const brandFace = (brand: string): readonly [string, string] => FACES[brand.toLowerCase()] ?? ["#0B1F45", "#123A86"];
