import type { Query } from "@tanstack/react-query";
import { shouldPersist } from "./queryPersist";

const q = (key: unknown[], status = "success") => ({ queryKey: key, state: { status } }) as unknown as Query;

describe("persisted cache policy", () => {
  it("keeps public catalogue queries that succeeded", () => {
    expect(shouldPersist(q(["services", "c1", "uz"]))).toBe(true);
    expect(shouldPersist(q(["plans", "uz"]))).toBe(true);
    expect(shouldPersist(q(["lawyers", {}]))).toBe(true);
  });
  it("never writes personal or failed data to disk", () => {
    expect(shouldPersist(q(["entitlements"]))).toBe(false);
    expect(shouldPersist(q(["admin-payouts", "list"]))).toBe(false);
    expect(shouldPersist(q(["my-matches"]))).toBe(false);
    expect(shouldPersist(q(["plans", "uz"], "error"))).toBe(false);
  });
});
