import { en } from "./locales/en";
import { ru } from "./locales/ru";
import { uz } from "./locales/uz";

type Tree = { [k: string]: string | Tree };
function flat(o: Tree, p = "", out: Record<string, string> = {}): Record<string, string> {
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === "string") out[p + k] = v;
    else if (v && typeof v === "object") flat(v as Tree, `${p}${k}.`, out);
  }
  return out;
}
const U = flat(uz as unknown as Tree);
const R = flat(ru as unknown as Tree);
const E = flat(en as unknown as Tree);
// Variables a string uses: {n}, and the subject of an ICU plural {n, plural, …}; {{doc markers}} are literal text.
const holes = (s: string): string => [...new Set([...s.replace(/\{\{[^}]*\}\}/g, "").matchAll(/\{(\w+)(?:,\s*plural,|\})/g)].map((m) => m[1]))].sort().join(",");

describe("locales", () => {
  it("ru has every uz key and nothing extra", () => {
    expect(Object.keys(U).filter((k) => !(k in R))).toEqual([]);
    expect(Object.keys(R).filter((k) => !(k in U))).toEqual([]);
  });
  it("en has every uz key and nothing extra", () => {
    expect(Object.keys(U).filter((k) => !(k in E))).toEqual([]);
    expect(Object.keys(E).filter((k) => !(k in U))).toEqual([]);
  });
  it("no translation is empty", () => {
    for (const m of [U, R, E]) expect(Object.entries(m).filter(([, v]) => !v.trim()).map(([k]) => k)).toEqual([]);
  });
  it("{placeholders} match between languages", () => {
    const bad = Object.keys(U).filter((k) => k in R && k in E && (holes(U[k]) !== holes(R[k]) || holes(U[k]) !== holes(E[k])));
    expect(bad).toEqual([]);
  });
});
