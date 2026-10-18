// Messages the bootstrap page posts to React Native. Never logged: they can carry document state.
export type EditorMsg = { t: "app" | "ready" | "dirty" | "error" | "fail" | "close"; d?: unknown };
const TYPES = ["app", "ready", "dirty", "error", "fail", "close"];

export function parseMsg(raw: string): EditorMsg | null {
  try {
    const m = JSON.parse(raw) as { t?: unknown; d?: unknown };
    return typeof m.t === "string" && TYPES.includes(m.t) ? ({ t: m.t, d: m.d } as EditorMsg) : null;
  } catch {
    return null;
  }
}

// Navigation inside the editor WebView stays on the document server; other links go to the system browser.
export function sameOrigin(url: string, origin: string): boolean {
  return url === "about:blank" || url.startsWith("blob:") || url === origin || url.startsWith(`${origin}/`);
}
