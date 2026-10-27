import { normPlan } from "../api/normPlan";
import { audienceKind, audiencesOf, benefitLines, forViewer, normVersion, viewerOf } from "./planInfo";

const plan = (o: Record<string, unknown>) => normPlan({ id: "p", slug: "s", title: "T", ...o }, "uz");

describe("audience per viewer", () => {
  const client = plan({ audiences: ["client"] });
  const personal = plan({ audience: "personal", audiences: ["personal"] });
  const seller = plan({ audience: "seller", audiences: ["seller"] });
  const adv = plan({ audiences: ["advokat", "client"] });
  const yur = plan({ audiences: ["legal_specialist"] });
  const pro = plan({ audiences: ["Professional"] });
  const none = plan({});
  it("client and guest: client or personal", () => {
    const v = viewerOf(undefined);
    expect([client, personal, adv, seller, yur, pro, none].map((p) => forViewer(p, v))).toEqual([true, true, true, false, false, false, true]);
    expect(viewerOf("client")).toBe("client");
  });
  it("advokat: advokat, seller, lawyer or professional", () => {
    const v = viewerOf("advocate");
    expect([client, personal, adv, seller, yur, pro, none, plan({ audiences: ["lawyer"] })].map((p) => forViewer(p, v))).toEqual([false, false, true, true, false, true, true, true]);
  });
  it("yurist: yurist, seller, legal_specialist or professional", () => {
    const v = viewerOf("lawyer");
    expect([client, adv, seller, yur, pro, none, plan({ audiences: ["yurist"] })].map((p) => forViewer(p, v))).toEqual([false, false, true, true, true, true, true]);
  });
  it("falls back to audience, then target_roles; nothing at all stays visible", () => {
    expect(audiencesOf({ audience: "Seller" })).toEqual(["seller"]);
    expect(audiencesOf({ target_roles: ["client"] })).toEqual(["client"]);
    expect(audiencesOf({ audiences: [], audience: "", target_roles: [] })).toEqual([]);
    expect(audiencesOf({ audiences: "client" })).toEqual(["client"]);
  });
  it("captions the side a plan is for", () => {
    expect([client, seller, adv, none].map(audienceKind)).toEqual(["client", "pro", "", ""]);
  });
});

describe("version and benefits", () => {
  it("version is a number, a numeric string or an object with its effective date", () => {
    expect(normVersion({ current_version: 3 })).toEqual({ version: 3, versioned: true, effectiveFrom: "" });
    expect(normVersion({ current_version: "2" })).toMatchObject({ version: 2, versioned: true });
    expect(normVersion({ current_version: { version: 4, effective_from: "2026-10-01T00:00:00Z" } })).toEqual({ version: 4, versioned: true, effectiveFrom: "2026-10-01T00:00:00Z" });
    expect(normVersion({ current_version: 1, effective_at: "2026-09-02" }).effectiveFrom).toBe("2026-09-02");
  });
  it("a missing or broken version is not shown", () => {
    expect(normVersion({})).toEqual({ version: 1, versioned: false, effectiveFrom: "" });
    expect(normVersion({ current_version: {} }).versioned).toBe(false);
    expect(normVersion({ current_version: null }).versioned).toBe(false);
    expect(normVersion({ current_version: 0 }).versioned).toBe(false);
  });
  it("benefit lines keep the backend's order and drop blanks", () => {
    expect(benefitLines({ benefits: ["B", " A ", "", "C"] }, "uz")).toEqual(["B", "A", "C"]);
    expect(benefitLines({ features: { uz: ["x", "y"], ru: ["я", "ю"] }, benefits: ["z"] }, "ru")).toEqual(["я", "ю"]);
    expect(benefitLines({ features: { uz: ["x", "y"] }, benefits: ["z"] }, "en")).toEqual(["x", "y"]);
    expect(benefitLines({ benefits: [{ text: "second", sort_order: 2 }, { text: "first", sort_order: 1 }] }, "uz")).toEqual(["first", "second"]);
    expect(benefitLines({}, "uz")).toEqual([]);
  });
  it("normPlan carries them, without internal fields", () => {
    const p = plan({ benefits: ["a", "b"], current_version: { version: 5 }, audiences: ["client"], developer_notes: "secret", deadline: "2026-12-01", trial_days: 7 });
    expect(p).toMatchObject({ features: ["a", "b"], version: 5, versioned: true, audiences: ["client"] });
    expect(JSON.stringify(p)).not.toMatch(/secret|2026-12-01|trial/);
  });
});
