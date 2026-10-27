import type { RaCommand } from "@/entities/remote-assist/model/types";
import { createQueue } from "./queue";

const cmd = (id: string, createdAt: number, status = "pending"): RaCommand => ({ id, actionId: "element.highlight", pageId: "p", componentId: "x", payload: {}, expectedUiRevision: 1, requiresConfirmation: false, status, createdAt, expiresAt: 0 });
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("command queue", () => {
  it("runs commands one at a time, oldest first, and never the same id twice (socket + history after a reconnect)", async () => {
    const ran: string[] = [];
    const q = createQueue({ canRun: () => true, run: async (c) => void ran.push(c.id), answered: () => false });
    q.add([cmd("b", 2), cmd("a", 1)]);
    await flush();
    q.add([cmd("a", 1), cmd("c", 3)]);
    await flush();
    expect(ran).toEqual(["a", "b", "c"]);
  });

  it("skips answered and settled commands, and holds the rest while the session may not act", async () => {
    let may = false;
    const ran: string[] = [];
    const q = createQueue({ canRun: () => may, run: async (c) => void ran.push(c.id), answered: (id) => id === "done" });
    q.add([cmd("done", 1), cmd("old", 2, "executed"), cmd("asked", 3, "confirmation_required"), cmd("new", 4)]);
    await flush();
    expect(ran).toEqual([]);
    expect(q.size()).toBe(1);
    may = true;
    q.drain();
    await flush();
    expect(ran).toEqual(["new"]);
  });
});
