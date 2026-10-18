import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { translate } from "./useT";

const SRC = join(__dirname, "..", "..");
function files(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    if (n === "locales" || n === "node_modules") continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n)) out.push(p);
  }
  return out;
}

// Every `t("ns.key")` with a literal key must exist, or the screen shows the raw key to the user.
describe("translation keys used in code", () => {
  it("all literal keys exist in uz (the fallback language)", () => {
    const missing: string[] = [];
    for (const f of files(SRC)) {
      const text = readFileSync(f, "utf8");
      for (const m of text.matchAll(/\bt\(\s*"([a-zA-Z][a-zA-Z0-9_]*\.[a-zA-Z0-9_.]+)"/g)) {
        if (translate("uz", m[1]) === m[1]) missing.push(`${f.slice(SRC.length + 1)}: ${m[1]}`);
      }
    }
    expect([...new Set(missing)]).toEqual([]);
  });
});
