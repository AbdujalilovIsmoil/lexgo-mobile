import { Image } from "react-native";
import HTML from "../../../assets/robot/robot.html";
import GLB from "../../../assets/robot/lexgo-robot.glb";

const uriOf = (a: number): string => Image.resolveAssetSource(a).uri;

let html: Promise<string> | null = null;
let glb: Promise<string> | null = null;

// The scene (three.js + robot code, assets/robot/robot.html) as text, fetched once per app run.
export const loadRobotHtml = (): Promise<string> => (html ??= fetch(uriOf(HTML)).then((r) => r.text()));

// The model (assets/robot/lexgo-robot.glb) as base64, ready to hand to the scene.
export const loadRobotModel = (): Promise<string> =>
  (glb ??= fetch(uriOf(GLB)).then(async (r) => {
    const bytes = new Uint8Array(await r.arrayBuffer());
    let out = "";
    for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(out);
  }));
