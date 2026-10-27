import { Dimensions } from "react-native";
import type { RaRect } from "./types";

type Measurable = { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null | undefined;

// Window rectangle of a native view, or null when it is not laid out (zero size, unmounted, or no answer within 700 ms).
export function measureView(node: unknown): Promise<RaRect | null> {
  return new Promise((resolve) => {
    const n = node as Measurable;
    if (!n?.measureInWindow) return resolve(null);
    const guard = setTimeout(() => resolve(null), 700);
    n.measureInWindow((x, y, width, height) => {
      clearTimeout(guard);
      resolve(width > 0 && height > 0 && Number.isFinite(x) && Number.isFinite(y) ? { x, y, width, height } : null);
    });
  });
}

/** True when the whole rectangle lies inside the window (a highlight needs the control on screen). */
export function fullyInWindow(r: RaRect): boolean {
  const { width, height } = Dimensions.get("window");
  return r.x >= -1 && r.y >= -1 && r.x + r.width <= width + 1 && r.y + r.height <= height + 1;
}
