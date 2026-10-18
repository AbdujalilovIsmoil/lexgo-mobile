import { shareGet } from "./dedupe";

describe("shareGet", () => {
  it("shares one request between identical concurrent GETs", async () => {
    const run = jest.fn(async () => "data");
    const [a, b] = await Promise.all([shareGet("/x", {}, "tok", run), shareGet("/x", {}, "tok", run)]);
    expect(run).toHaveBeenCalledTimes(1);
    expect([a, b]).toEqual(["data", "data"]);
  });
  it("starts a new request after the first one finished", async () => {
    const run = jest.fn(async () => 1);
    await shareGet("/y", {}, "tok", run);
    await shareGet("/y", {}, "tok", run);
    expect(run).toHaveBeenCalledTimes(2);
  });
  it("never shares writes, other users or other paths", async () => {
    const run = jest.fn(async () => 1);
    await Promise.all([shareGet("/z", { method: "POST", body: {} }, "t", run), shareGet("/z", { method: "POST", body: {} }, "t", run)]);
    expect(run).toHaveBeenCalledTimes(2);
    run.mockClear();
    await Promise.all([shareGet("/p", {}, "a", run), shareGet("/p", {}, "b", run), shareGet("/q", {}, "a", run)]);
    expect(run).toHaveBeenCalledTimes(3);
  });
  it("lets the next call retry after a failure", async () => {
    const run = jest.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce("ok");
    await expect(shareGet("/f", {}, "t", run)).rejects.toThrow("boom");
    await expect(shareGet("/f", {}, "t", run)).resolves.toBe("ok");
  });
});
