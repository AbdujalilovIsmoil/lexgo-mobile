import { placementState } from "./placementState";
import type { PendingPromo, Running } from "../model/types";

const run = (placement: Running["placement"], daysLeft: number) => ({ placement, daysLeft }) as Running;
const wait = (target: string) => ({ target }) as PendingPromo;

describe("placementState", () => {
  it("is off without anything", () => expect(placementState("banner", [], [])).toEqual({ kind: "off" }));
  it("takes the longest running promotion", () => expect(placementState("service_boost", [run("service_boost", 2), run("service_boost", 9), run("banner", 30)], [])).toEqual({ kind: "active", daysLeft: 9 }));
  it("waits for approval", () => {
    expect(placementState("banner", [], [wait("banner")])).toEqual({ kind: "pending" });
    expect(placementState("service_boost", [], [wait("service:42")])).toEqual({ kind: "pending" });
    expect(placementState("profile_boost", [], [wait("banner")])).toEqual({ kind: "off" });
  });
});
