import { Image } from "react-native";
import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import HTML from "../../../assets/robot/robot.html";
import GLB from "../../../assets/robot/lexgo-robot.glb";

let html: Promise<string> | null = null;
let glb: Promise<string> | null = null;

// A release build has no Metro server: html / glb are packaged files (Android raw resources, iOS bundle files), so
// `fetch(Image.resolveAssetSource(x).uri)` only worked in dev. expo-asset copies the packaged file to a real file:// uri.
async function localFile(mod: number): Promise<File> {
  const asset = Asset.fromModule(mod);
  if (!asset.localUri) await asset.downloadAsync();
  return new File(asset.localUri ?? asset.uri);
}

// Failed loads are not cached, so the next mount tries again instead of staying without a robot for the whole run.
const once = <T>(slot: () => Promise<T> | null, set: (p: Promise<T> | null) => void, make: () => Promise<T>): Promise<T> => {
  const cur = slot();
  if (cur) return cur;
  const p = make().catch((e) => { set(null); throw e; });
  set(p);
  return p;
};

// The scene (three.js + robot code, assets/robot/robot.html) as text.
export const loadRobotHtml = (): Promise<string> =>
  once(() => html, (p) => { html = p; }, async () => {
    try { return await (await localFile(HTML)).text(); } catch { return fetch(Image.resolveAssetSource(HTML).uri).then((r) => r.text()); }
  });

export function toBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(out);
}

// The model (assets/robot/lexgo-robot.glb) as base64, ready to hand to the scene.
export const loadRobotModel = (): Promise<string> =>
  once(() => glb, (p) => { glb = p; }, async () => {
    try { return toBase64(await (await localFile(GLB)).bytes()); } catch { return toBase64(new Uint8Array(await (await fetch(Image.resolveAssetSource(GLB).uri)).arrayBuffer())); }
  });
