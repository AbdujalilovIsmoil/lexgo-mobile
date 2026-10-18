import { Dimensions } from "react-native";
import type { Rect } from "./types";

type Measurable = { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null | undefined;

// Window-relative rectangle of a native node, or null when it is not laid out (zero size / unmounted).
export function measureNode(node: unknown): Promise<Rect | null> {
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

// True when the rectangle shows (at least partly) inside the window.
export function inWindow(r: Rect): boolean {
  const { width, height } = Dimensions.get("window");
  return r.x + r.width > 0 && r.y + r.height > 0 && r.x < width && r.y < height;
}
