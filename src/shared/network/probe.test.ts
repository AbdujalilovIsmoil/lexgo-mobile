import { probeApi } from "./probe";

type Handler = (() => void) | null;
class FakeXhr {
  static next: (x: FakeXhr) => void = () => undefined;
  onload: Handler = null;
  onerror: Handler = null;
  ontimeout: Handler = null;
  responseText = "";
  url = "";
  aborted = false;
  open(_m: string, url: string) { this.url = url; }
  send() { FakeXhr.next(this); }
  abort() { this.aborted = true; }
}

beforeAll(() => { (globalThis as { XMLHttpRequest?: unknown }).XMLHttpRequest = FakeXhr; });

describe("probeApi", () => {
  it("any HTTP answer is reachable", async () => {
    FakeXhr.next = (x) => setTimeout(() => x.onload?.(), 1);
    const r = await probeApi(1000);
    expect(r.ok).toBe(true);
  });
  it("a failure keeps the OS's own error text", async () => {
    FakeXhr.next = (x) => setTimeout(() => { x.responseText = "The Internet connection appears to be offline."; x.onerror?.(); }, 1);
    const r = await probeApi(1000);
    expect(r).toMatchObject({ ok: false, error: "The Internet connection appears to be offline." });
  });
  it("no answer in time is a timeout, and the request is cancelled", async () => {
    let req: FakeXhr | null = null;
    FakeXhr.next = (x) => { req = x; };
    const r = await probeApi(20);
    expect(r).toMatchObject({ ok: false, error: "timeout 20 ms" });
    expect((req as FakeXhr | null)?.aborted).toBe(true);
  });
  it("asks the API's /health", async () => {
    let url = "";
    FakeXhr.next = (x) => { url = x.url; setTimeout(() => x.onload?.(), 1); };
    await probeApi(1000);
    expect(url).toMatch(/^https:\/\/.+\/health\?probe=1$/);
  });
});
