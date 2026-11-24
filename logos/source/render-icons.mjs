import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const D = process.argv[2], CH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const g = pathToFileURL(D + "/logo.png").href;
// Silhouette: luminance -> alpha (white logo background becomes transparent, black/blue become opaque white).
const SIL = `<svg width="0" height="0" style="position:absolute"><filter id="a" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -0.2126 -0.7152 -0.0722 0 1"/></filter></svg>`;
// name, canvas px, logo scale (fraction of canvas), background, silhouette?
const T = [
  ["fg", 1024, 0.80, "#FFFFFF", false],     // launcher foreground (the white of the logo merges with the white launcher background)
  ["mono", 1024, 0.80, "transparent", true], // Android 13+ themed icon
  ["notif", 96, 0.94, "transparent", true],  // notification icon
];
for (const [n, s, k, bg, sil] of T) {
  const w = Math.round(s * k), off = Math.round((s - w) / 2);
  writeFileSync(`${D}/${n}.html`, `<!doctype html><meta charset=utf-8><style>*{margin:0}html,body{width:${s}px;height:${s}px;background:${bg};overflow:hidden}img{position:absolute;left:${off}px;top:${off}px;width:${w}px;${sil ? "filter:url(#a)" : "filter:brightness(1.015)"}}</style>${SIL}<img src="${g}">`);
  spawnSync(CH, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--allow-file-access-from-files", "--default-background-color=00000000", `--window-size=${s},${s}`, `--screenshot=${D}/${n}.png`, pathToFileURL(`${D}/${n}.html`).href], { encoding: "utf8" });
  console.log("ok", n);
}
