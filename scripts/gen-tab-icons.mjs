// Draws the iOS system tab bar's icons from Lucide: UITabBar takes images, not SVG, so each icon becomes a black template PNG (25 pt, @1x-@3x) in assets/tabs; the system tints it.
// macOS only (sips). Run after changing the list, or a Lucide upgrade: node scripts/gen-tab-icons.mjs
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ICONS = ["house", "layout-grid", "shopping-bag", "message-circle", "inbox", "users"]; // keep in step with src/widgets/tab-bar/tabIcons.tsx
const POINTS = 25;
const SCALES = [1, 2, 3];

// The icon's shapes from the Lucide package. Its modules import React Native, so the data is read from the file, not imported.
function shapes(name) {
  const source = readFileSync(`node_modules/lucide-react-native/dist/esm/icons/${name}.mjs`, "utf8");
  const data = source.match(/const __iconData = (\{[\s\S]*?\n\});/)?.[1];
  if (!data) throw new Error(`No icon data in ${name}`);
  return new Function(`return ${data}`)().node;
}

function svg(name, px) {
  const body = shapes(name).map(([tag, { key: _key, ...attrs }]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

const dir = mkdtempSync(join(tmpdir(), "tab-icons-"));
try {
  for (const name of ICONS) {
    for (const scale of SCALES) {
      const from = join(dir, `${name}-${scale}.svg`);
      writeFileSync(from, svg(name, POINTS * scale));
      execFileSync("sips", ["-s", "format", "png", from, "--out", `assets/tabs/${name}${scale > 1 ? `@${scale}x` : ""}.png`], { stdio: "ignore" });
    }
  }
} finally {
  rmSync(dir, { recursive: true });
}
