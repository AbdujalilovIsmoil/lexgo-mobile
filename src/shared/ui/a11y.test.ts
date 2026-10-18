import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { translate } from "@/shared/i18n";

const SRC = join(__dirname, "..", "..");
function files(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.tsx$/.test(n)) out.push(p);
  }
  return out;
}

// An icon-only button is read out by its icon's name, so every icon used in an <IconButton> needs a spoken label (unless
// the call passes its own `label`).
describe("IconButton labels", () => {
  const used = new Set<string>();
  for (const f of files(SRC)) {
    for (const m of readFileSync(f, "utf8").matchAll(/<IconButton\b[^>]*?>?\s*(?:\/>|>)/gs)) {
      const tag = m[0];
      const icon = /\bicon="([a-z0-9-]+)"/.exec(tag)?.[1];
      if (icon && !/\blabel=/.test(tag)) used.add(icon);
    }
  }
  it("finds some icons to check", () => expect(used.size).toBeGreaterThan(5));
  it.each([...used])("has a spoken label in every language: %s", (icon) => {
    for (const l of ["uz", "ru", "en"] as const) expect(translate(l, `a11y.icon.${icon}`)).not.toBe(`a11y.icon.${icon}`);
  });
});
