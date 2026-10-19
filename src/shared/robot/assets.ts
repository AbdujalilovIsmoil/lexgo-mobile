import { bundledBytes, bundledText, keepOnSuccess } from "@/shared/lib/bundled";
import HTML from "../../../assets/robot/robot.html";
import GLB from "../../../assets/robot/lexgo-robot.glb";

export function toBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(out);
}

// The scene (three.js + robot code, assets/robot/robot.html) as text. Read from the packaged file, so it works in release
// builds too; a failed load is not kept, so the next mount tries again instead of staying without a robot for the whole run.
export const loadRobotHtml = keepOnSuccess(() => bundledText(HTML));

// The model (assets/robot/lexgo-robot.glb) as base64, ready to hand to the scene.
export const loadRobotModel = keepOnSuccess(async () => toBase64(await bundledBytes(GLB)));
