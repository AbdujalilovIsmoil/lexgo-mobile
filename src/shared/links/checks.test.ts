import { runChecks } from "./checks/run";

// The table-driven resolver cases (events × viewers, URLs) as part of the test run.
describe("link resolver table", () => {
  it("every case resolves as expected", () => {
    const r = runChecks();
    expect(r.failures).toEqual([]);
    expect(r.total).toBeGreaterThan(50);
  });
});
