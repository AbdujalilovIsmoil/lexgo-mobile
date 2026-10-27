import { raPlaceOf, raTarget } from "./routes";

describe("remote-assistance route allowlist", () => {
  it("maps the web client's routes (what the operator console sends) to this app's screens", () => {
    expect(raTarget("/portal/client/subscription")).toEqual({ pageId: "client.subscription", route: "/subscription", tab: false, href: "/subscription" });
    expect(raTarget("/portal/client/lawyers")).toMatchObject({ route: "/lawyers", tab: true, pageId: "client.marketplace" });
    expect(raTarget("/portal/client/lawyers/abc-1")).toMatchObject({ route: "/specialist/abc-1", tab: false });
    expect(raTarget("/lawyers/abc-1")).toMatchObject({ route: "/specialist/abc-1" });
    expect(raTarget("/uz/portal/client/profile")).toMatchObject({ route: "/profile", tab: true });
    expect(raTarget("/portal/client/marketplace-orders/o1")).toMatchObject({ route: "/orders/o1", tab: false });
    expect(raTarget("/portal/client/services")).toMatchObject({ route: "/services", pageId: "client.documents" });
    expect(raTarget("/portal/client/documents")).toMatchObject({ route: "/documents", pageId: "client.my_documents" });
    expect(raTarget("/portal/client/works/w-9")).toMatchObject({ route: "/works/w-9", pageId: "client.my_works" });
    expect(raTarget("/portal/client/urgent-advokat")).toMatchObject({ route: "/urgent" });
    expect(raTarget("/portal/client")).toMatchObject({ route: "/", tab: true });
  });

  it("accepts the app's own client routes and keeps only the safe query keys", () => {
    expect(raTarget("/subscription")).toMatchObject({ route: "/subscription", tab: false });
    expect(raTarget("/support/t-1")).toMatchObject({ route: "/support/t-1", pageId: "client.support" });
    expect(raTarget("/support?new=1&evil=2")).toMatchObject({ route: "/support", href: "/support?new=1" });
    expect(raTarget("/subscription?tab=x")).toMatchObject({ href: "/subscription" });
    expect(raTarget("/profile/")).toMatchObject({ route: "/profile" });
  });

  it("never opens sign-in, payments, security, identity, settings, the call, the professional's area or anything external", () => {
    const blocked: unknown[] = [
      "/auth/login", "/auth/otp", "/payments", "/payments/p1", "/portal/client/payments", "/security", "/security/totp", "/settings/notifications",
      "/settings/security-lock", "/profile/methods", "/call/r1", "/pro/orders", "/pro", "/m/lawyers", "/admin", "/portal/advocate", "/portal/lawyer/clients",
      "/call-center/support", "https://evil.example/x", "//evil.example", "javascript:alert(1)", "/support/../security", "/support%2fsecurity",
      "/support#x", "/chat/room-1", "", "   ", 42, null, undefined, { route: "/support" }, "/".padEnd(600, "a"),
    ];
    for (const r of blocked) expect([r, raTarget(r)]).toEqual([r, null]);
  });

  it("names where the client is: a known page, or client.outside with the bare path", () => {
    expect(raPlaceOf("/subscription")).toEqual({ pageId: "client.subscription", route: "/subscription", tab: false });
    expect(raPlaceOf("/m/lawyers")).toEqual({ pageId: "client.marketplace", route: "/lawyers", tab: true }); // iOS: a tab page opened as a stack screen
    expect(raPlaceOf("/m/index")).toMatchObject({ pageId: "client.dashboard", route: "/" });
    expect(raPlaceOf("/call/r1")).toEqual({ pageId: "client.outside", route: "/call/r1", tab: false });
    expect(raPlaceOf("/payments?x=1")).toEqual({ pageId: "client.outside", route: "/payments", tab: false });
  });
});
