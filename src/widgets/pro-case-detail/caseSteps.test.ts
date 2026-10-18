import { STEPS, stepIndex } from "./caseSteps";

it("places a status on the case's path", () => {
  expect(stepIndex("new")).toBe(0);
  expect(stepIndex("court")).toBe(3);
  expect(stepIndex("completed")).toBe(STEPS.length - 1);
  expect(stepIndex("archived")).toBe(STEPS.length - 1);
  expect(stepIndex("something-else")).toBe(0);
});
