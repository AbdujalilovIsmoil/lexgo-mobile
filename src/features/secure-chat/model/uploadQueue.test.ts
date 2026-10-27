import { uploadQueue } from "./uploadQueue";

const flush = () => new Promise((r) => setImmediate(r));
function deferred() {
  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

describe("uploadQueue", () => {
  it("runs one upload at a time, in the order they were sent", async () => {
    const q = uploadQueue();
    const d = { a: deferred(), b: deferred(), c: deferred() };
    const log: string[] = [];
    let active = 0;
    let peak = 0;
    const task = (id: keyof typeof d) => async () => {
      active += 1;
      peak = Math.max(peak, active);
      log.push(id);
      await d[id].promise;
      active -= 1;
    };
    expect(q.idle()).toBe(true);
    q.push("a", task("a"));
    q.push("b", task("b"));
    q.push("c", task("c"));
    expect(q.idle()).toBe(false);
    await flush();
    expect(log).toEqual(["a"]);
    d.a.resolve();
    await flush();
    expect(log).toEqual(["a", "b"]);
    d.b.resolve();
    await flush();
    d.c.resolve();
    await flush();
    expect(log).toEqual(["a", "b", "c"]);
    expect(peak).toBe(1);
    expect(q.idle()).toBe(true);
  });

  it("goes on after a failed upload", async () => {
    const q = uploadQueue();
    const ran: string[] = [];
    q.push("a", async () => { ran.push("a"); throw new Error("413"); });
    q.push("b", async () => { ran.push("b"); });
    await flush();
    await flush();
    expect(ran).toEqual(["a", "b"]);
    expect(q.idle()).toBe(true);
  });

  it("never starts an upload dropped while it waits; the running one is not droppable", async () => {
    const q = uploadQueue();
    const a = deferred();
    const ran: string[] = [];
    q.push("a", async () => { ran.push("a"); await a.promise; });
    q.push("b", async () => { ran.push("b"); });
    q.push("c", async () => { ran.push("c"); });
    await flush();
    expect(q.drop("a")).toBe(false); // running: the caller aborts its request instead
    expect(q.drop("b")).toBe(true);
    expect(q.drop("b")).toBe(false);
    a.resolve();
    await flush();
    await flush();
    expect(ran).toEqual(["a", "c"]);
  });

  it("does not add an upload that is already waiting", async () => {
    const q = uploadQueue();
    const a = deferred();
    const ran: string[] = [];
    q.push("a", async () => { await a.promise; });
    q.push("b", async () => { ran.push("b"); });
    q.push("b", async () => { ran.push("b again"); });
    a.resolve();
    await flush();
    await flush();
    expect(ran).toEqual(["b"]);
  });

  it("a retried upload goes to the end of the line", async () => {
    const q = uploadQueue();
    const a = deferred();
    const ran: string[] = [];
    q.push("a", async () => { ran.push("a"); await a.promise; });
    q.push("b", async () => { ran.push("b"); });
    await flush();
    q.push("a", async () => { ran.push("a retry"); }); // a is running, not waiting: queued again, behind b
    a.resolve();
    await flush();
    expect(ran).toEqual(["a", "b", "a retry"]);
  });

  it("waits for the gate before each start", async () => {
    const gates: (() => void)[] = [];
    const q = uploadQueue(() => new Promise<void>((open) => gates.push(open)));
    const ran: string[] = [];
    q.push("a", async () => { ran.push("a"); });
    q.push("b", async () => { ran.push("b"); });
    await flush();
    expect(ran).toEqual([]);
    expect(q.drop("a")).toBe(true); // held back by the gate, so still waiting
    gates[0]();
    await flush();
    expect(ran).toEqual(["b"]);
    q.push("c", async () => { ran.push("c"); });
    await flush();
    expect(ran).toEqual(["b"]);
    gates[1]();
    await flush();
    expect(ran).toEqual(["b", "c"]);
    expect(gates).toHaveLength(2);
  });
});
