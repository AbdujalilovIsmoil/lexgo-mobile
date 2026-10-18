// Bundles scripts/robot/robot.src.js (three.js + the robot scene) into one self-contained HTML file:
//   node scripts/robot/build.mjs   →   assets/robot/robot.html
import { build } from "esbuild";
import { writeFileSync } from "node:fs";

const out = await build({ entryPoints: ["scripts/robot/robot.src.js"], bundle: true, minify: true, format: "iife", write: false, target: "es2019" });
const js = out.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body{margin:0;height:100%;background:transparent;overflow:hidden}canvas{display:block;width:100%;height:100%;touch-action:none}</style></head><body><script>${js}</script></body></html>`;
writeFileSync("assets/robot/robot.html", html);
console.log("assets/robot/robot.html", Math.round(html.length / 1024), "KB");
