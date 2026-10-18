import { appHref } from "./appRoutes";
import { parseExternal } from "./external";
import { mayOpen, safeHome } from "./guard";
import { resolveLink, resolveUrl } from "./resolve";
import type { Viewer } from "./types";

const HOSTS = ["lexgo.uz", "www.lexgo.uz"] as const;
const v = (kind: Viewer["kind"], extra: Partial<Viewer> = {}): Viewer => ({ signedIn: true, kind, orgOwner: false, callCenterLawyer: false, ...extra });

describe("parseExternal", () => {
  it("accepts lexgo:// and https on our hosts, and cleans the path", () => {
    expect(parseExternal("lexgo://chat/abc", HOSTS)).toEqual({ path: "/chat/abc", query: {}, web: false });
    expect(parseExternal("lexgo:///payments?tab=x", HOSTS)).toEqual({ path: "/payments", query: { tab: "x" }, web: false });
    expect(parseExternal("https://lexgo.uz/uz/portal/client/gifts", HOSTS)).toEqual({ path: "/portal/client/gifts", query: {}, web: true });
    expect(parseExternal("https://www.lexgo.uz:443/", HOSTS)).toEqual({ path: "/", query: {}, web: true });
  });
  it("refuses foreign schemes and hosts", () => {
    for (const bad of ["http://lexgo.uz/x", "https://evil.com/x", "https://lexgo.uz.evil.com/x", "javascript:alert(1)", "intent://x", "file:///etc/passwd", "data:text/html,x", "https://lexgo.uz@evil.com/", "chat/abc"]) expect(parseExternal(bad, HOSTS)).toBeNull();
  });
  it("refuses traversal, control characters, backslashes and huge input", () => {
    for (const bad of ["lexgo://chat/../admin", "lexgo://a/%2e%2e/b", "lexgo://x\ny", "lexgo://a\\b", "lexgo://" + "a".repeat(3000), ""]) expect(parseExternal(bad, HOSTS)).toBeNull();
  });
  it("collapses slashes and survives a malformed escape in the query", () => {
    expect(parseExternal("lexgo://chat//abc///", HOSTS)?.path).toBe("/chat/abc");
    expect(parseExternal("lexgo://payments?a=%E0%A4%A&b=2", HOSTS)?.query).toEqual({ b: "2" });
    expect(parseExternal("lexgo://payments?q=a+b", HOSTS)?.query).toEqual({ q: "a b" });
  });
});

describe("appHref", () => {
  it("passes planned routes and maps tabs", () => {
    expect(appHref("/")).toBe("/");
    expect(appHref("/payments")).toBe("/payments");
    expect(appHref("/ratings")).toBe("/ratings");
    expect(appHref("/messages")).toBe("/(tabs)/messages");
    expect(appHref("/index")).toBe("/");
    expect(appHref("/chat/abc", { id: "1", evil: "2" })).toBe("/chat/abc?id=1");
  });
  it("opens the scanner (no outside parameters), only for sellers", () => {
    expect(appHref("/pro/scan", { folder: "f1" })).toBe("/pro/scan"); // outside links never choose the folder
    expect(mayOpen("/pro/scan", v("client"))).toBe(false);
    expect(mayOpen("/pro/scan", v("seller"))).toBe(true);
  });
  it("refuses unplanned routes", () => {
    for (const bad of ["/_sitemap", "/settings/secret", "/profile/edit", "/pro", "/random", "/chat"]) expect(appHref(bad)).toBeNull();
  });
});

describe("guard", () => {
  it("keeps roles inside their own area", () => {
    expect(mayOpen("/pro/orders", v("client"))).toBe(false);
    expect(mayOpen("/pro/orders", v("seller"))).toBe(true);
    expect(mayOpen("/org/members", v("seller"))).toBe(false);
    expect(mayOpen("/org/members", v("seller", { orgOwner: true }))).toBe(true);
    expect(mayOpen("/manage/chats", v("client"))).toBe(false);
    expect(mayOpen("/manage/chats", v("staff"))).toBe(true);
    expect(mayOpen("/cc/calls", v("client"))).toBe(false);
    expect(mayOpen("/cc/calls", v("client", { callCenterLawyer: true }))).toBe(true);
    expect(mayOpen("/payments?x=1", v("client"))).toBe(true);
    expect(mayOpen("/profile/gifts", v("client"))).toBe(true); // not under "/pro"
    expect(mayOpen("/profile/referral", v("callcenter"))).toBe(true);
    expect(mayOpen("/organization", v("client"))).toBe(true);
  });
  it("safeHome per role", () => {
    expect(safeHome({ ...v("client"), signedIn: false })).toBe("/");
    expect(safeHome(v("seller"))).toBe("/(tabs)/workspace");
    expect(safeHome(v("callcenter"))).toBe("/(tabs)/leads");
    expect(safeHome(v("staff"))).toBe("/(tabs)/admin");
    expect(safeHome(v("client"))).toBe("/");
  });
});

describe("resolveUrl / resolveLink", () => {
  it("opens an allowed link and blocks everything else", () => {
    expect(resolveUrl("lexgo://payments", v("client"))).toMatchObject({ kind: "target", target: { href: "/payments" } });
    expect(resolveUrl("https://evil.com/payments", v("client"))).toEqual({ kind: "blocked", fallback: "/" });
    expect(resolveUrl("lexgo://pro/orders", v("client"))).toEqual({ kind: "blocked", fallback: "/" });
  });
  it("maps website portal pages to app screens", () => {
    expect(resolveUrl("https://lexgo.uz/uz/portal/client/gifts", v("client"))).toMatchObject({ kind: "target", target: { href: "/profile/gifts" } });
  });
  it("routes a chat notification to its room, a bad deep link falls back to the subject", () => {
    const r = resolveLink({ event: "secure_chat.message_created", entityType: "secure_chat", entityId: "r1", deepLink: "javascript:x" }, v("client"));
    expect(r).toMatchObject({ kind: "target", target: { href: "/chat/r1" } });
  });
  it("answers none when nothing is openable", () => {
    expect(resolveLink({}, v("client"))).toEqual({ kind: "none" });
  });
});
