// Screens where the floating assistant button must not appear: the AI tab itself, auth, calls, chat rooms
// and editors (it would cover a composer / the call controls), and the assistant's own route.
const HIDE = ["/ai", "/auth", "/instructor", "/assistant", "/chat/", "/urgent/new", "/support/", "/call/", "/security", "/settings/security-lock"];
// Bottom-tab pages (the floating tab bar is on screen): the button sits above it.
const TABS = ["/", "/services", "/works", "/messages", "/workspace", "/requests", "/clients", "/lawyers", "/orders", "/profile"];

// The guide robot floats on Home too, above the tab bar.
export const launcherHidden = (path: string): boolean => HIDE.some((h) => path === h || path.startsWith(h.endsWith("/") ? h : `${h}/`)) || /\/editor$/.test(path);
export const hasTabBar = (path: string): boolean => TABS.includes(path);
