import type { Locale } from "./localeStore";

type Params = Record<string, string | number>;
const HEAD = /\{(\w+),\s*plural,/;

// The CLDR plural category of an integer, for the three app languages (uz has only "other").
export function pluralCategory(locale: Locale, n: number): "one" | "few" | "many" | "other" {
  const i = Math.abs(Math.trunc(n));
  if (locale === "en") return i === 1 ? "one" : "other";
  if (locale !== "ru") return "other";
  const m10 = i % 10;
  const m100 = i % 100;
  if (m10 === 1 && m100 !== 11) return "one";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "few";
  return "many";
}

// Reads `{...}` starting at `from` (which points at "{"); returns its inside and the index after the closing brace.
function block(s: string, from: number): [string, number] {
  let depth = 0;
  for (let i = from; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}" && --depth === 0) return [s.slice(from + 1, i), i + 1];
  }
  return [s.slice(from + 1), s.length];
}

// ICU `{n, plural, one {# page} other {# pages}}` → the right branch with `#` = n. Text without such a block is returned as is.
export function applyPlural(s: string, params: Params | undefined, locale: Locale): string {
  let out = s;
  for (let guard = 0; guard < 8; guard++) {
    const m = HEAD.exec(out);
    if (!m) break;
    const [inside, end] = block(out, m.index);
    const opts: Record<string, string> = {};
    const re = /\s*(\w+)\s*\{/g;
    let rest = inside.slice(m[0].length - 1);
    for (let hit = re.exec(rest); hit; hit = re.exec(rest)) {
      const [body, next] = block(rest, hit.index + hit[0].length - 1);
      opts[hit[1]] = body;
      rest = rest.slice(next);
      re.lastIndex = 0;
    }
    const n = Number(params?.[m[1]] ?? 0);
    const pick = opts[pluralCategory(locale, n)] ?? opts.other ?? "";
    out = out.slice(0, m.index) + pick.replace(/#/g, String(n)) + out.slice(end);
  }
  return out;
}
