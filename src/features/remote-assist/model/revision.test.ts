import { createRevision } from "./revision";

describe("ui_revision", () => {
  it("strictly increases and never falls to or below what the server holds", () => {
    const r = createRevision();
    const seen: number[] = [];
    const servers = [0, 0, 14, 3, 3, 40, 0];
    for (const s of servers) seen.push(r.next(s, "client.profile|/profile|"));
    for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeGreaterThan(seen[i - 1]);
    seen.forEach((v, i) => expect(v).toBeGreaterThan(servers[i]));
    expect(seen).toEqual([1, 2, 15, 16, 17, 41, 42]);
  });

  it("jumps ahead after remote_assist_ui_revision_stale", () => {
    const r = createRevision();
    r.next(0, "a");
    r.skip();
    expect(r.next(0, "a")).toBe(7);
    expect(r.current()).toBe(7);
  });

  it("marks where the current page context began: a newer state of the same page keeps it, another page / sheet moves it", () => {
    const r = createRevision();
    r.next(0, "client.support|/support|");
    r.next(0, "client.support|/support|"); // a field filled
    expect(r.page()).toBe(1);
    r.next(0, "client.support|/support|support.new_chat"); // the new-chat sheet opened
    expect(r.page()).toBe(3);
    r.next(0, "client.subscription|/subscription|");
    expect(r.page()).toBe(4);
  });
});
