import { blockControl, claimedPage, claimPage, findControl, raControls, registerControl } from "./registry";
import { sensitivityOf } from "./secret";
import type { RaControlSpec } from "./types";

const entry = (spec: RaControlSpec) => ({ read: () => spec, measure: async () => null });
const control = (id: string, label = id, extra: Partial<RaControlSpec> = {}): RaControlSpec => ({ id, label, actions: ["element.highlight"], ...extra });

describe("remote-assistance registry", () => {
  it("never registers a secret control, whatever the screen declares", () => {
    const offs = [
      registerControl(entry(control("profile.password"))),
      registerControl(entry(control("checkout.card_number"))),
      registerControl(entry(control("auth.otp"))),
      registerControl(entry(control("sign.esign.code"))),
      registerControl(entry(control("identity.passport"))),
      registerControl(entry(control("support.answer", "SMS kod"))),
      registerControl(entry(control("support.answer2", "Parol"))),
      registerControl(entry(control("plain.field", "Name", { sensitivity: "secret" }))),
    ];
    expect(raControls()).toEqual([]);
    expect(findControl("profile.password")).toBeNull();
    offs.forEach((off) => off());
  });

  it("raises personal fields to personal and never lowers a declared level", () => {
    expect(sensitivityOf("profile.full_name", "To'liq ism")).toBe("personal");
    expect(sensitivityOf("profile.email", "E-mail", "normal")).toBe("personal");
    expect(sensitivityOf("profile.region", "Hudud")).toBe("personal");
    expect(sensitivityOf("support.topic", "Mavzu")).toBe("normal");
    expect(sensitivityOf("support.topic", "Mavzu", "personal")).toBe("personal");
    expect(sensitivityOf("profile.pin_code", "Kod", "normal")).toBe("secret");
    const off = registerControl(entry(control("profile.email", "E-mail")));
    expect(findControl("profile.email")?.sensitivity).toBe("personal");
    off();
  });

  it("takes a control off only with its own registration", () => {
    const first = registerControl(entry(control("subscription.plan.pro", "Pro")));
    const second = registerControl(entry(control("subscription.plan.pro", "Pro (new)")));
    first(); // the stale one goes; the newer registration stays
    expect(findControl("subscription.plan.pro")?.label).toBe("Pro (new)");
    second();
    expect(findControl("subscription.plan.pro")).toBeNull();
  });

  it("reads the latest spec, with ready as the default state", () => {
    let state: RaControlSpec["state"] = undefined;
    const off = registerControl({ read: () => control("support.urgent", "Shoshilinch", { state }), measure: async () => null });
    expect(findControl("support.urgent")?.state).toBe("ready");
    state = "selected";
    expect(findControl("support.urgent")?.state).toBe("selected");
    off();
  });

  it("a control the backend called secret leaves the map for good", () => {
    const off = registerControl(entry(control("support.ref_code", "Kod")));
    expect(findControl("support.ref_code")).not.toBeNull();
    blockControl("support.ref_code");
    expect(findControl("support.ref_code")).toBeNull();
    expect(raControls().map((c) => c.id)).not.toContain("support.ref_code");
    off();
  });

  it("the last focused screen's page claim wins and a released claim hands it back", () => {
    const a = claimPage("client.support");
    const b = claimPage("client.subscription");
    expect(claimedPage()).toBe("client.subscription");
    b();
    expect(claimedPage()).toBe("client.support");
    a();
    expect(claimedPage()).toBe("");
  });
});
