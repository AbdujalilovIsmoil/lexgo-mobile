import { ApiError } from "@/shared/api";
import { eventKey, quoteKey } from "./keys";
import { soErrorKind } from "./errors";
import { addDirection, canQuote, clampCount, toggleDirection } from "./selection";

const opts = { minCount: 2, maxCount: 7 };

describe("keys", () => {
  it("build the README's stable keys", () => {
    expect(eventKey("o1", "in_progress", "s1", "impression")).toBe("second-opinion:o1:in_progress:s1:impression");
    expect(quoteKey("o1", "s1", "video", 3)).toBe("second-opinion:o1:s1:quote:video:3");
  });
});

describe("soErrorKind", () => {
  const err = (status: number, code?: string) => new ApiError(status, "x", { code });
  it("maps the README's error table", () => {
    expect(soErrorKind(err(401))).toBe("unauthorized");
    expect(soErrorKind(err(404, "source_order_not_found"))).toBe("order_not_found");
    expect(soErrorKind(err(409, "second_opinion_not_available"))).toBe("not_available");
    expect(soErrorKind(err(409, "second_opinion_placement_mismatch"))).toBe("placement_mismatch");
    expect(soErrorKind(err(422, "second_opinion_channel_required"))).toBe("channel_required");
    expect(soErrorKind(err(422, "second_opinion_lawyer_count_invalid"))).toBe("count_invalid");
    expect(soErrorKind(err(402, "previous_lexgo_advokat_service_required"))).toBe("previous_service_required");
  });
  it("falls back to the status, and to network / other", () => {
    expect(soErrorKind(err(402))).toBe("previous_service_required");
    expect(soErrorKind(err(404))).toBe("order_not_found");
    expect(soErrorKind(err(0))).toBe("network");
    expect(soErrorKind(err(500))).toBe("other");
    expect(soErrorKind(new Error("boom"))).toBe("other");
  });
});

describe("selection", () => {
  it("a price may be asked for only with a channel and a count inside the range", () => {
    expect(canQuote({ channel: "", count: 3, directions: [] }, opts)).toBe(false);
    expect(canQuote({ channel: "video", count: 1, directions: [] }, opts)).toBe(false);
    expect(canQuote({ channel: "chat", count: 8, directions: [] }, opts)).toBe(false);
    expect(canQuote({ channel: "chat", count: 2, directions: [] }, opts)).toBe(true);
  });
  it("clamps the count into the range", () => {
    expect([clampCount(0, opts), clampCount(3, opts), clampCount(99, opts)]).toEqual([2, 3, 7]);
  });
  it("toggles and adds directions without duplicates", () => {
    expect(toggleDirection(["A"], "a")).toEqual([]);
    expect(toggleDirection(["A"], "B")).toEqual(["A", "B"]);
    expect(addDirection(["Shartnoma"], "  shartnoma ")).toEqual(["Shartnoma"]);
    expect(addDirection(["A"], "  ")).toEqual(["A"]);
    expect(addDirection(["A"], "B  c")).toEqual(["A", "B c"]);
  });
});
