import { turnsFromExif } from "./types";

it("turns sideways photos upright and leaves already-upright pixels alone", () => {
  expect(turnsFromExif(1, 4000, 3000)).toBe(0);
  expect(turnsFromExif(6, 4000, 3000)).toBe(1);
  expect(turnsFromExif(6, 3000, 4000)).toBe(0);
  expect(turnsFromExif(8, 4000, 3000)).toBe(3);
  expect(turnsFromExif(3, 4000, 3000)).toBe(2);
});
