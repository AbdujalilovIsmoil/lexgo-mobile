import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const D = process.argv[2], CH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const g = pathToFileURL(D + "/glyph.png").href;
const NAVY = "#0B1F45";
// name, canvas px, glyph scale (fraction of canvas for the whole 1254 image), background, filter
const T = [
  ["fg", 1024, 0.58, "transparent", ""],
  ["mono", 1024, 0.58, "transparent", "filter:brightness(0) invert(1)"],
  ["notif", 96, 0.92, "transparent", "filter:brightness(0) invert(1)"],
  ["store1024", 1024, 0.70, NAVY, ""],
  ["play512", 512, 0.70, NAVY, ""],
];
for (const [n, s, k, bg, f] of T) {
  const w = Math.round(s * k);
  writeFileSync(`${D}/${n}.html`, `<!doctype html><meta charset=utf-8><style>*{margin:0}html,body{width:${s}px;height:${s}px;background:${bg};overflow:hidden}img{position:absolute;left:${(s - w) / 2}px;top:${(s - w) / 2}px;width:${w}px;${f}}</style><img src="${g}">`);
  spawnSync(CH, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--allow-file-access-from-files", "--default-background-color=00000000", `--window-size=${s},${s}`, `--screenshot=${D}/${n}.png`, pathToFileURL(`${D}/${n}.html`).href], { encoding: "utf8" });
  console.log("ok", n);
}
