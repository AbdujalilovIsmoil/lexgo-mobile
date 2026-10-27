import type { Dict } from "./json";

// The public LexGo badge (Marketplace Enterprise contract §22): `is_verified` when the payload carries it, else `lexgo_verified`.
// verification_status, the badge object and every other field are internal and never decide it.
export function isLexgoVerified(d: Dict): boolean {
  if (typeof d.is_verified === "boolean") return d.is_verified;
  return d.lexgo_verified === true;
}
