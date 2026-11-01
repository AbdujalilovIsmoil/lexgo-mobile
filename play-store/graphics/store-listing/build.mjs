// Store-listing graphics for Google Play. Run: node play-store/graphics/store-listing/build.mjs
// Needs Google Chrome (headless) and macOS `sips`. Every screenshot in src/shots/ MUST be a real capture from the app.
// To add a screenshot: drop a 1080x2160 PNG in src/shots/, add a line to SLIDES, run the script.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "out");
const TMP = join(ROOT, "src", ".tmp");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const u = (p) => pathToFileURL(join(SRC, p)).href;

// kicker = small pill; title = headline, *word* is highlighted in cyan.
const SLIDES = [
  { n: "01", shot: "home.png", kicker: "LexGo", title: "Yuridik yordam *bir necha tegishda*" },
  { n: "02", shot: "ai-answer.png", kicker: "LexGo.AI", title: "AI javobi *qonun moddalari bilan*" },
  { n: "03", shot: "ai-start.png", kicker: "LexGo.AI", title: "Muammoni yozing, *AI yo'l ko'rsatadi*" },
  { n: "04", shot: "documents.png", kicker: "Hujjatlar", title: "Yuzlab tayyor hujjat *bir joyda*" },
  { n: "05", shot: "menu.png", kicker: "Menyu", title: "Tahlil, akademiya va kafolat *bir menyuda*" },
  { n: "06", shot: "login.png", kicker: "Xavfsiz kirish", title: "Telefon raqami bilan *tez kirish*" },
];

const FONTS = `
@font-face{font-family:Onest;font-weight:800;src:url("${u("assets/onest-800.ttf")}")}
@font-face{font-family:Onest;font-weight:700;src:url("${u("assets/onest-700.ttf")}")}
@font-face{font-family:Inter;font-weight:600;src:url("${u("assets/inter-600.ttf")}")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{overflow:hidden}
`;

// The logo image is a white rounded tile on a white page: clip it to the tile so it sits cleanly on a dark background.
const LOGO = (size) => `<div style="width:${size}px;height:${size}px;border-radius:${size * 0.22}px;overflow:hidden;box-shadow:0 14px 40px rgba(0,8,40,.45)">
  <img src="${u("assets/logo.png")}" style="width:${size / 0.865}px;height:${size / 0.865}px;margin:${-size * 0.0787}px 0 0 ${-size * 0.0787}px;display:block"></div>`;

const hl = (t) => t.replace(/\*(.+?)\*/g, '<span class="hl">$1</span>');

const phone = (shot, w) => `<div class="phone" style="width:${w}px;border-radius:${w * 0.105}px;padding:${w * 0.017}px">
  <div style="overflow:hidden;border-radius:${w * 0.088}px"><img src="${u("shots/" + shot)}" style="width:100%;display:block;margin-top:-9.26%"></div></div>`; // -9.26% = the 100px status-bar strip of a 1080px capture

const BG = `background:
  radial-gradient(900px 700px at 85% 8%, rgba(0,200,255,.32), transparent 60%),
  radial-gradient(800px 700px at 0% 100%, rgba(40,110,255,.45), transparent 60%),
  linear-gradient(160deg,#04122f 0%,#0a2a6e 55%,#0d49b8 100%);`;

const PHONE_CSS = `.phone{background:linear-gradient(160deg,#27385e,#0a1226);box-shadow:0 40px 80px rgba(0,8,40,.55),0 0 0 2px rgba(255,255,255,.08) inset}
.hl{background:linear-gradient(90deg,#5ee0ff,#7fb2ff);-webkit-background-clip:text;color:transparent}`;

function slideHtml(s) {
  return `<!doctype html><meta charset=utf-8><style>${FONTS}${PHONE_CSS}
body{width:1080px;height:1920px;${BG}position:relative;font-family:Onest}
.kick{position:absolute;left:70px;top:78px;display:flex;align-items:center;gap:18px}
.kick b{font:700 30px Inter;letter-spacing:.14em;text-transform:uppercase;color:#bfe3ff;font-weight:600}
h1{position:absolute;left:70px;top:190px;width:940px;font:800 88px/1.04 Onest;color:#fff;letter-spacing:-.02em}
.p{position:absolute;left:150px;top:560px}
</style>
<div class="kick">${LOGO(84)}<b>${s.kicker}</b></div>
<h1>${hl(s.title)}</h1>
<div class="p">${phone(s.shot, 780)}</div>`;
}

const featureHtml = `<!doctype html><meta charset=utf-8><style>${FONTS}${PHONE_CSS}
body{width:1024px;height:500px;${BG}position:relative;font-family:Onest}
.logo{position:absolute;left:56px;top:54px}
h1{position:absolute;left:56px;top:176px;width:520px;font:800 50px/1.06 Onest;color:#fff;letter-spacing:-.02em}
.chips{position:absolute;left:56px;top:372px;display:flex;gap:10px}
.chips span{font:600 19px Inter;color:#e8f4ff;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.28);padding:9px 16px;border-radius:99px}
.a{position:absolute;left:612px;top:70px;transform:rotate(-7deg)}
.b{position:absolute;left:792px;top:34px;transform:rotate(6deg)}
</style>
<div class="logo">${LOGO(104)}</div>
<h1>Yuridik yordam endi <span class="hl">bir necha tegishda</span></h1>
<div class="chips"><span>Advokat</span><span>Hujjat</span><span>AI yordamchi</span></div>
<div class="a">${phone("home.png", 232)}</div>
<div class="b">${phone("ai-answer.png", 232)}</div>`;

function render(name, html, w, h) {
  const f = join(TMP, name + ".html");
  writeFileSync(f, html);
  const png = join(OUT, name + ".png");
  const r = spawnSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--allow-file-access-from-files", `--window-size=${w},${h}`, `--screenshot=${png}`, pathToFileURL(f).href], { encoding: "utf8" });
  if (!existsSync(png)) throw new Error(`chrome failed for ${name}: ${r.stderr}`);
  // Play wants 24-bit PNG / JPEG with no alpha channel: JPEG q95 is the simplest way to drop it.
  const jpg = join(OUT, name + ".jpg");
  spawnSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "95", png, "--out", jpg]);
  console.log("ok", name);
}

render("feature-graphic-1024x500", featureHtml, 1024, 500);
for (const s of SLIDES) {
  if (!existsSync(join(SRC, "shots", s.shot))) { console.log("skip (no screenshot)", s.shot); continue; }
  render(`screenshot-${s.n}`, slideHtml(s), 1080, 1920);
}
