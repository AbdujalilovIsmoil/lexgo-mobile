import type { Query } from "@tanstack/react-query";
import { shouldPersist } from "./queryPersist";

const q = (key: unknown[], status = "success") => ({ queryKey: key, state: { status } }) as unknown as Query;

describe("persisted cache policy", () => {
  it("keeps public catalogue queries that succeeded", () => {
    expect(shouldPersist(q(["services", "c1", "uz"]))).toBe(true);
    expect(shouldPersist(q(["plans", "uz"]))).toBe(true);
    expect(shouldPersist(q(["lawyers", {}]))).toBe(true);
    expect(shouldPersist(q(["doc-templates", "legal-doc-civil"]))).toBe(true);
    expect(shouldPersist(q(["doc-template-categories"]))).toBe(true);
  });
  it("never writes personal or failed data to disk", () => {
    expect(shouldPersist(q(["entitlements"]))).toBe(false);
    expect(shouldPersist(q(["admin-payouts", "list"]))).toBe(false);
    expect(shouldPersist(q(["my-matches"]))).toBe(false);
    expect(shouldPersist(q(["doc-template", "t1"]))).toBe(false); // a template page holds the whole text
    expect(shouldPersist(q(["doc-template-render", "t1", "uz"]))).toBe(false);
    expect(shouldPersist(q(["plans", "uz"], "error"))).toBe(false);
  });
});
