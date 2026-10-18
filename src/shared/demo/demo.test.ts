import { demoAnswer } from "./mocks";
import { demoOn, useDemo } from "./demoStore";
import { getCabinet } from "@/entities/pro-workspace/api/cabinetApi";
import { http } from "@/shared/api";

describe("demo data", () => {
  it("is off by default and answers only listed paths, ignoring the query", () => {
    expect(demoOn()).toBe(false);
    expect(demoAnswer("/clients/me/works?limit=100&offset=0")).toBeDefined();
    expect(demoAnswer("/some/other/path")).toBeUndefined();
  });
  it("the seller cabinet demo is read by the real parser (counts, orders with a live deadline, cases)", async () => {
    useDemo.getState().set(true);
    const c = await getCabinet();
    useDemo.getState().set(false);
    expect(c.limited).toBe(false);
    expect(c.orders.length).toBe(2);
    expect(c.orders.every((o) => Date.parse(o.deadline) > Date.now())).toBe(true);
    expect(c.cases.length).toBe(4);
    expect(c.clients).toBe(7);
  });
  it("http answers a demo GET locally and leaves other methods alone", async () => {
    useDemo.getState().set(true);
    const works = (await http("/clients/me/works?limit=100")) as { items: unknown[] };
    useDemo.getState().set(false);
    expect(works.items.length).toBe(4);
  });
});
