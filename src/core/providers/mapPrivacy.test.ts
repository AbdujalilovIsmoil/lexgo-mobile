import type { Query } from "@tanstack/react-query";
import { shouldPersist } from "./queryPersist";

// The contract: client coordinates never reach persistent local storage. Map queries carry them in their keys, so they must never be persisted.
describe("map data is never written to the phone", () => {
  const q = (key: unknown[]) => ({ queryKey: key, state: { status: "success" } }) as unknown as Query;
  it("does not persist nearby / viewport / geocoder / consent queries", () => {
    expect(shouldPersist(q(["market-map", "nearby", { lat: 41.3, lon: 69.2 }]))).toBe(false);
    expect(shouldPersist(q(["market-map", "bbox", { bbox: [69, 41, 70, 42] }]))).toBe(false);
    expect(shouldPersist(q(["market-map", "geocode", "Amir Temur"]))).toBe(false);
    expect(shouldPersist(q(["market-map", "consent"]))).toBe(false);
  });
});
