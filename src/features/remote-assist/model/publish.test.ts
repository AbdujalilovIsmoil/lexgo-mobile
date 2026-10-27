import { claimPage, registerControl } from "@/shared/remote-assist/registry";
import type { RaControlSpec } from "@/shared/remote-assist/types";
import { readView, signatureOf } from "./publish";

const reg = (spec: RaControlSpec) => registerControl({ read: () => spec, measure: async () => null });

describe("published client state", () => {
  it("carries identity and coarse state only — never a value — and only the actions the contract knows", () => {
    const offs = [
      claimPage("client.profile"),
      // a screen that (wrongly) keeps the field's value next to the control: it still never leaves the phone
      reg({ id: "profile.full_name", label: "To'liq ism", actions: ["element.highlight", "form.set_value", "page.fly"], state: "filled", setValue: () => ({ ok: true }), value: "Ali Valiyev" } as RaControlSpec),
      reg({ id: "profile.save", label: "Saqlash", actions: ["element.highlight", "confirmation.present"], state: "disabled" }),
      reg({ id: "profile.password", label: "Parol", actions: ["form.set_value"], state: "filled" }),
    ];
    const view = readView("/profile/edit", new Set(["element.highlight", "form.set_value", "confirmation.present"]));
    expect(view).toEqual({
      pageId: "client.profile",
      route: "/profile/edit",
      modal: "",
      elements: [
        { component_id: "profile.full_name", label: "To'liq ism", actions: ["element.highlight", "form.set_value"], sensitivity: "personal", state: "filled" },
        { component_id: "profile.save", label: "Saqlash", actions: ["element.highlight"], sensitivity: "normal", state: "disabled" },
      ],
    });
    expect(JSON.stringify(view)).not.toContain("Ali Valiyev");
    offs.forEach((off) => off());
  });

  it("a screen without an adapter is published as its route with no elements", () => {
    const off = reg({ id: "stray.control", label: "x", actions: ["element.highlight"] });
    expect(readView("/call/room-1", null)).toEqual({ pageId: "client.outside", route: "/call/room-1", modal: "", elements: [] });
    expect(readView("/notifications", null)).toMatchObject({ pageId: "client.notifications", route: "/notifications" });
    off();
  });

  it("an open registered sheet is part of the page context", () => {
    const offs = [claimPage("client.support"), reg({ id: "support.new_chat", label: "Yangi", actions: ["modal.open"], state: "selected", open: () => ({ ok: true }) })];
    const view = readView("/support", null);
    expect(view.modal).toBe("support.new_chat");
    expect(signatureOf(view)).toContain("support.new_chat:selected:modal.open");
    offs.forEach((off) => off());
  });
});
