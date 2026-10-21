import { TEAM_TASKS, isActive, navFor } from "./navItems";

const keys = (r: Parameters<typeof navFor>[0]) => navFor(r).map((x) => x.key);

describe("drawer rows per role", () => {
  it("client and visitor share the web portal's rows", () => {
    expect(navFor("guest")).toBe(navFor("client"));
  });
  it("every role has rows, a label for each and no duplicate keys", () => {
    for (const r of ["guest", "client", "seller", "callcenter", "sales", "staff"] as const) {
      const list = navFor(r);
      expect(list.length).toBeGreaterThan(4);
      expect(new Set(list.map((x) => x.key)).size).toBe(list.length);
      if (r !== "client" && r !== "guest") expect(list.every((x) => !!x.label)).toBe(true);
    }
  });
  it("a professional starts with their workspace and has the pro tools; staff with home", () => {
    expect(keys("seller").slice(0, 2)).toEqual(["dashboard", "marketplace"]);
    expect(keys("seller")).toEqual(expect.arrayContaining(["cases", "notifications", "security", "stats"]));
    expect(keys("callcenter")[0]).toBe("leads");
    expect(keys("staff")[0]).toBe("home");
  });
});

describe("seller drawer follows the web sidebar", () => {
  const WEB_LAWYER = ["dashboard", "marketplace", "marketplaceOrders", "cases", "urgentAssigned", "tasks", "calendar", "clients", "services", "documents", "documentRequests", "files", "chat", "meetings", "notifications", "ai", "assistant", "referrals", "promotion", "subscription", "support"];
  const WEB_ADVOCATE = ["dashboard", "opportunities", "marketplaceOrders", "cases", "urgentAssigned", "documentRequests", "calendar", "clients", "services", "tasks", "messages", "meetings", "notifications", "organization", "files", "assistant", "referrals", "promotion", "subscription", "support"];
  it("a yurist sees LAWYER_NAV in its order", () => expect(navFor("seller", { kind: "lawyer" }).map((i) => i.key).slice(0, WEB_LAWYER.length)).toEqual(WEB_LAWYER));
  it("an advokat sees ADVOCATE_NAV (organization only for the owner)", () => {
    expect(navFor("seller", { kind: "advocate", orgOwner: true }).map((i) => i.key).slice(0, WEB_ADVOCATE.length)).toEqual(WEB_ADVOCATE);
    expect(navFor("seller", { kind: "advocate" }).map((i) => i.key)).not.toContain("organization");
  });
  it("every row has a title in the web's words and a route inside the app", () => {
    for (const i of navFor("seller", { kind: "lawyer" })) {
      expect(i.label).toBeTruthy();
      expect(i.route.startsWith("/")).toBe(true);
    }
  });
});

describe("sales operator drawer follows the web sidebar", () => {
  const WEB_SALES = ["pipeline", "duty", "smeetings", "callAnalytics", "marketplace", "notifySend"];
  it("the role's rows in the web order (funnel, duty desk and meetings are tabs), then the settings", () => {
    expect(keys("sales").slice(0, WEB_SALES.length)).toEqual(WEB_SALES);
    expect(navFor("sales").slice(0, 3).map((i) => i.route)).toEqual(["/(tabs)/pipeline", "/(tabs)/duty", "/(tabs)/smeetings"]);
  });
  it("a row needs its module", () => {
    const rows = navFor("sales", { modules: new Set(["pipeline", "meetings"]) }).map((i) => i.key);
    expect(rows.slice(0, 2)).toEqual(["pipeline", "smeetings"]);
    expect(rows).not.toContain("duty");
    expect(rows).not.toContain("callAnalytics");
  });
});

describe("isActive", () => {
  it("tab routes match the path without the (tabs) group", () => {
    expect(isActive("/(tabs)/workspace", "/workspace")).toBe(true);
    expect(isActive("/(tabs)/clients", "/clients")).toBe(true);
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/pro/cases", "/pro/cases/abc")).toBe(true);
    expect(isActive("/pro/cases", "/pro/calendar")).toBe(false);
  });
});

describe("no profile row in any drawer (the header has the profile button)", () => {
  it("has none for any role", () => {
    for (const r of ["guest", "client", "seller", "callcenter", "sales", "staff"] as const) {
      expect(navFor(r, { kind: "lawyer" }).filter((i) => i.key === "profile" || i.route === "/profile" || i.route === "/pro/profile")).toEqual([]);
      expect(navFor(r, { kind: "advocate", orgOwner: true }).filter((i) => i.key === "profile")).toEqual([]);
    }
  });
});

describe("seller rows follow the web's permission rules (both kinds)", () => {
  const SETTINGS_SAMPLE = "security";
  it("an account under review keeps only the allowed rows, the onboarding steps and the settings", () => {
    const yurist = navFor("seller", { kind: "lawyer", limited: true }).map((i) => i.key);
    expect(yurist).toEqual(expect.arrayContaining(["dashboard", "services", "subscription", "notifications", "support", "onboarding", SETTINGS_SAMPLE]));
    expect(yurist).not.toEqual(expect.arrayContaining(["marketplace"]));
    expect(yurist).not.toContain("cases");
    expect(yurist).not.toContain("stats");
    const advokat = navFor("seller", { kind: "advocate", limited: true }).map((i) => i.key);
    expect(advokat).toEqual(expect.arrayContaining(["dashboard", "subscription", "notifications", "support", "onboarding", SETTINGS_SAMPLE]));
    expect(advokat).not.toContain("services"); // the web gives an advokat under review no services row
    expect(advokat).not.toContain("opportunities");
  });
  it("orders and chats need the cabinet's actions", () => {
    const none = { acceptOrders: false, secureChat: false };
    expect(navFor("seller", { kind: "lawyer", actions: none }).map((i) => i.key)).not.toEqual(expect.arrayContaining(["marketplace"]));
    expect(navFor("seller", { kind: "lawyer", actions: none }).map((i) => i.key)).not.toContain("chat");
    expect(navFor("seller", { kind: "advocate", actions: none }).map((i) => i.key)).not.toContain("opportunities");
    expect(navFor("seller", { kind: "advocate", actions: none }).map((i) => i.key)).not.toContain("messages");
    const all = { acceptOrders: true, secureChat: true };
    expect(navFor("seller", { kind: "advocate", actions: all }).map((i) => i.key)).toEqual(expect.arrayContaining(["opportunities", "messages"]));
  });
  it("hides nothing while the cabinet is unknown", () => {
    expect(navFor("seller", { kind: "advocate" }).map((i) => i.key)).toEqual(expect.arrayContaining(["opportunities", "messages", "cases", "stats"]));
  });
});

describe("a professional's profile links live in the sidebar", () => {
  const ACCOUNT = ["edit", "payments", "plan", "family", "methods", "consents", "gifts", "complaints", "warranty"];
  it("both kinds list the account screens, after the tools and before the settings", () => {
    for (const kind of ["lawyer", "advocate"]) {
      const keys = navFor("seller", { kind }).map((i) => i.key);
      expect(keys).toEqual(expect.arrayContaining(ACCOUNT));
      expect(keys.indexOf("edit")).toBeGreaterThan(keys.indexOf("stats"));
      expect(keys.indexOf("edit")).toBeLessThan(keys.indexOf("security"));
    }
  });
  it("an account under review can still reach its own data", () => {
    expect(navFor("seller", { kind: "lawyer", limited: true }).map((i) => i.key)).toEqual(expect.arrayContaining(ACCOUNT));
  });
  it("the organisation rows belong to its owner and never repeat a route", () => {
    const owner = navFor("seller", { kind: "lawyer", orgOwner: true }).map((i) => i.key);
    expect(owner).toEqual(expect.arrayContaining(["org", "orgMembers", "orgWorkload"]));
    expect(navFor("seller", { kind: "lawyer" }).map((i) => i.key)).not.toContain("orgMembers");
    for (const kind of ["lawyer", "advocate"]) {
      const routes = navFor("seller", { kind, orgOwner: true, callCenterLawyer: true }).map((i) => i.route);
      expect(new Set(routes).size).toBe(routes.length);
    }
  });
  it("the document pool is for a call-center lawyer", () => {
    expect(navFor("seller", { kind: "lawyer", callCenterLawyer: true }).map((i) => i.key)).toContain("docPool");
    expect(navFor("seller", { kind: "lawyer" }).map((i) => i.key)).not.toContain("docPool");
  });
});

describe("the team's tasks row", () => {
  it("is one fixed row with the web's title, and a route inside the app", () => {
    expect(TEAM_TASKS).toMatchObject({ key: "teamTasks", route: "/team-tasks", label: "ttm.title" });
  });
});

describe("on-duty call-centre lawyer drawer follows the web admin sidebar", () => {
  const duty = ["pipeline", "callcenter", "meetings", "callAnalytics", "marketplace", "templates", "support", "notifications"].map((key) => ({ key, icon: "grid" as const }));
  const list = navFor("seller", { kind: "advocate", callCenterLawyer: true, duty });
  it("lists the web rows in order, each an admin screen, then the way back to the portal", () => {
    expect(list.slice(0, duty.length).map((i) => i.key)).toEqual(duty.map((d) => d.key));
    expect(list.slice(0, duty.length).every((i) => i.route === `/manage/${i.key}`)).toBe(true);
    expect(list[duty.length].key).toBe("dashboard");
  });
  it("has none of the advocate portal's account, stats or document-pool rows", () => {
    expect(list.map((i) => i.key)).not.toEqual(expect.arrayContaining(["stats", "family", "methods"]));
    expect(list.length).toBeLessThan(navFor("seller", { kind: "advocate", callCenterLawyer: true }).length / 2);
  });
});
